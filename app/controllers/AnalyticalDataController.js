const Amostra = require("../models/Amostra");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AnalyticalDataController {
  static async getAnalytical(req, res) {
    const os_analytics = await getOrdemDeServicoStats();
    const ensaios_analytics = await getTotalEnsaiosPorData();
    const demanda_ensaios = await getDemandaDeEnsaiosPorSemana();
    const ensaios_em_atraso = await getEnsaiosEmAtraso();
    res.status(200).json({ os_analytics, ensaios_analytics , demanda_ensaios, ensaios_em_atraso });
  }
};
async function getDemandaDeEnsaiosPorSemana() {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const stats = await Amostra.aggregate([
    {
      $match: {
        status: { $in: ["Autorizada", "Em Execução"] },
        prazo_inicio_fim: { $ne: "Aguardando" },
        updatedAt: { $gte: twoMonthsAgo },
      },
    },
    {
      $addFields: {
        ensaios: {
          $filter: {
            input: { $split: ["$ensaios_solicitados", ","] },
            as: "ensaio",
            cond: { $ne: [{ $trim: { input: "$$ensaio" } }, ""] }
          }
        },
        prazo_inicio: {
          $arrayElemAt: [{ $split: ["$prazo_inicio_fim", " - "] }, 0],
        },
      },
    },
    {
      $addFields: {
        semana: {
          $week: { 
            $dateFromString: { 
              dateString: "$prazo_inicio", 
              format: "%d/%m/%Y" 
            } 
          }
        }
      }
    },
    {
      $unwind: "$ensaios"
    },
    {
      $group: {
        _id: {
          ensaio: { $trim: { input: "$ensaios" } },
          semana: "$semana"
        },
        quantidade: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.ensaio",
        semanas: { 
          $push: { 
            semana: { $toString: "$_id.semana" }, 
            quantidade: "$quantidade" 
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        ensaio: "$_id",
        semanas: {
          $let: {
            vars: {
              sortedSemanas: { 
                $sortArray: { 
                  input: "$semanas", 
                  sortBy: { semana: 1 } 
                } 
              }
            },
            in: {
              semana: { $map: { input: "$$sortedSemanas", as: "s", in: "$$s.semana" } },
              quantidade: { $map: { input: "$$sortedSemanas", as: "s", in: "$$s.quantidade" } }
            }
          }
        }
      }
    }
  ]);

  // Otimização: Calcular semanas uma vez
  const todasSemanas = [...new Set(stats.flatMap(item => 
    item.semanas.semana
  ))].sort();

  // Uso de map em vez de reduce para melhor performance
  const resultado = Object.fromEntries(
    stats.map(item => {
      const semanaMap = Object.fromEntries(
        item.semanas.semana.map((semana, index) => 
          [semana, item.semanas.quantidade[index]]
        )
      );

      const semanas = todasSemanas.map(semana => 
        semanaMap[semana] || 0
      );

      return [item.ensaio, {
        semana: todasSemanas,
        quantidade: semanas
      }];
    })
  );

  return resultado;
}

async function getOrdemDeServicoStats() {
  const aggregateData = async (matchCriteria, dateField) => {
    const result = await OrdemDeServico.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            year: { $year: `$${dateField}` },
            month: { $month: `$${dateField}` },
          },
          quantidade: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          quantidade: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);
    return result;
  };

  // Uso de Promise.all para execução paralela
  const [ordensDeServicosTotais, ordensDeServicoFinalizadas] = await Promise.all([
    aggregateData({}, "createdAt"),
    aggregateData({ status: "Finalizada" }, "updatedAt"),
  ]);

  // Uso de método map mais direto
  const total = ordensDeServicosTotais.map(item => item.quantidade);
  const finalizadas = ordensDeServicoFinalizadas.map(item => item.quantidade);

  // Otimização na criação de datas únicas
  const datas = [
    ...new Set([
      ...ordensDeServicosTotais.map(item => `${item.month}/${item.year}`),
      ...ordensDeServicoFinalizadas.map(item => `${item.month}/${item.year}`)
    ])
  ].sort();

  return { total, finalizadas, datas };
}

async function getTotalEnsaiosPorData() {
  const stats = await Amostra.aggregate([
    {
      $project: {
        timestamp: { $toLong: "$createdAt" },
        numero_ensaios: {
          $size: {
            $filter: {
              input: { $split: ["$ensaios_solicitados", ","] },
              as: "ensaio",
              cond: { $ne: ["$$ensaio", ""] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$timestamp",
        numero_total_de_ensaios: { $sum: "$numero_ensaios" },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        data: "$_id",
        numero_total_de_ensaios: 1,
      },
    },
  ]);

  // Uso direto do map
  return stats.map(item => [item.data, item.numero_total_de_ensaios]);
}

async function getEnsaiosEmAtraso() {
  const currentDate = new Date();

  const stats = await Amostra.aggregate([
    // Filtro inicial otimizado
    {
      $match: {
        status: { $ne: "Finalizada" },
        prazo_inicio_fim: {
          $ne: "Aguardando",
          $exists: true
        }
      }
    },

    // Processamento de datas otimizado
    {
      $addFields: {
        segundaData: {
          $dateFromString: {
            dateString: {
              $arrayElemAt: [
                { $split: ["$prazo_inicio_fim", " - "] },
                1
              ]
            },
            format: "%d/%m/%Y"
          }
        }
      }
    },

    // Filtro de amostras em atraso
    {
      $match: {
        segundaData: { $lt: currentDate }
      }
    },

    // Processamento de ensaios e resultados unificado
    {
      $project: {
        // Conversão de ensaios solicitados para array com tratamento de trim
        ensaios_solicitados: {
          $cond: {
            if: { $eq: [{ $type: "$ensaios_solicitados" }, "string"] },
            then: {
              $filter: {
                input: {
                  $map: {
                    input: { $split: ["$ensaios_solicitados", ","] },
                    as: "ensaio",
                    in: { $trim: { input: "$$ensaio", chars: " " } }
                  }
                },
                cond: { $ne: ["$$this", ""] }
              }
            },
            else: {
              $cond: {
                if: { $isArray: "$ensaios_solicitados" },
                then: {
                  $filter: {
                    input: {
                      $map: {
                        input: "$ensaios_solicitados",
                        as: "ensaio",
                        in: { $trim: { input: "$$ensaio", chars: " " } }
                      }
                    },
                    cond: { $ne: ["$$this", ""] }
                  }
                },
                else: []
              }
            }
          }
        },
        // Conversão de resultados para array de chaves
        resultados_keys: {
          $cond: {
            if: { $and: [
              { $ne: ["$resultados", null] },
              { $eq: [{ $type: "$resultados" }, "object"] }
            ]},
            then: {
              $map: {
                input: { $objectToArray: "$resultados" },
                as: "result",
                in: "$$result.k"
              }
            },
            else: []
          }
        }
      }
    },

    // Contagem e agrupamento otimizado
    {
      $group: {
        _id: null,
        totalAmostrasEmAtraso: { $sum: 1 },
        ensaios_solicitados: { $push: "$ensaios_solicitados" },
        resultados: { $push: "$resultados_keys" }
      }
    },

    // Processamento final otimizado
    {
      $project: {
        totalAmostrasEmAtraso: 1,
        ensaios_em_atraso: {
          $filter: {
            input: {
              $map: {
                input: { $setUnion: { $reduce: {
                  input: "$ensaios_solicitados",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] }
                }}},
                as: "ensaio",
                in: [
                  "$$ensaio",
                  { $max: [0, { $subtract: [
                    { $sum: { $map: {
                      input: "$ensaios_solicitados",
                      as: "solicitados",
                      in: { $cond: [
                        { $in: ["$$ensaio", "$$solicitados"] },
                        1,
                        0
                      ]}
                    }}},
                    { $sum: { $map: {
                      input: "$resultados",
                      as: "resultados",
                      in: { $cond: [
                        { $in: ["$$ensaio", "$$resultados"] },
                        1,
                        0
                      ]}
                    }}}
                  ]}]}
                ]
              }
            },
            cond: { $gt: ["$$this.1", 0] } // Filtra apenas ensaios com quantidade maior que 0
          }
        }
      }
    },

    // Estágio final para remover _id e manter apenas os campos desejados
    {
      $project: {
        _id: 0,
        totalAmostrasEmAtraso: 1,
        ensaios_em_atraso: 1
      }
    }
  ]);
  if (stats.length > 0 && stats[0].ensaios_em_atraso) {
    stats[0].ensaios_em_atraso = stats[0].ensaios_em_atraso.filter(item => item[1] > 0);
  }

  // Tratamento de retorno seguro
  return stats[0] ?? {
    totalAmostrasEmAtraso: 0,
    ensaios_em_atraso: []
  };
}
