const Amostra = require("../models/Amostra");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AnalyticalDataController {
  static async getAnalytical(req, res) {
    const os_analytics = await getOrdemDeServicoStats();
    const ensaios_analytics = await getTotalEnsaiosPorData();
    const demanda_ensaios = await getDemandaDeEnsaiosPorSemana();
    res.status(200).json({ os_analytics, ensaios_analytics , demanda_ensaios });
  }
  static async teste(req, res) {

    const teste = await getEnsaiosPorSemana();

    res.status(200).json({teste });
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

// Otimização para funções de agregação similares
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

// Otimização similar para getTotalEnsaiosPorData
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