
const Amostra = require("../models/Amostra");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AnalyticalDataController{
   
static async getAnalyticalOS(req,res){
 // const ordemdeservico_status = await getOrdemDeServicoStats()
const amostras_analytics =await getAmostraStats()
 res.status(200).json({ amostras_analytics })
}
 }

async function getOrdemDeServicoStats() {
  const possibleStatuses = [
    "Aguardando Autorização",
    "Autorizada",
    "Em Execução",
    "Finalizada",
    "Cancelada",
  ];

  const stats = await OrdemDeServico.aggregate([
    // Agrupa as ordens de serviço por status e conta
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    // Adiciona todos os status possíveis com contagem 0, caso não estejam presentes no banco
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: "$_id",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        stats: {
          $map: {
            input: possibleStatuses,
            as: "status",
            in: {
              status: "$$status",
              count: {
                $reduce: {
                  input: "$stats",
                  initialValue: 0,
                  in: {
                    $cond: [
                      { $eq: ["$$this.status", "$$status"] },
                      "$$this.count",
                      "$$value",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    // Desestrutura para um array simples (opcional)
    {
      $unwind: "$stats",
    },
    {
      $replaceRoot: { newRoot: "$stats" },
    },
  ]);

  return stats;
};

async function getAmostraStats(){
  const possibleStatuses = [
    "Aguardando Autorização",
    "Autorizada",
    "Em Execução",
    "Finalizada",
    "Cancelada",
  ];

  const stats = await Amostra.aggregate([
    // Agrupa as amostras por status e conta
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    // Adiciona todos os status possíveis com contagem 0, caso não estejam presentes no banco
    {
      $group: {
        _id: null,
        stats: {
          $push: {
            status: "$_id",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        stats: {
          $map: {
            input: possibleStatuses,
            as: "status",
            in: {
              status: "$$status",
              count: {
                $reduce: {
                  input: "$stats",
                  initialValue: 0,
                  in: {
                    $cond: [
                      { $eq: ["$$this.status", "$$status"] },
                      "$$this.count",
                      "$$value",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    // Desestrutura para um array simples (opcional)
    {
      $unwind: "$stats",
    },
    {
      $replaceRoot: { newRoot: "$stats" },
    },
  ]);

  return stats;
};

async function  getAmostrasPorEnsaiosEStatus(){
  const stats = await Amostra.aggregate([
    // Etapa 1: Dividir os ensaios_solicitados em uma lista de ensaios individuais
    {
      $addFields: {
        ensaios: {
          $map: {
            input: { $split: ["$ensaios_solicitados", ","] },
            as: "ensaio",
            in: { $trim: { input: "$$ensaio" } },
          },
        },
      },
    },
    // Etapa 2: Desnormalizar os ensaios (uma amostra pode ser duplicada para cada ensaio)
    { $unwind: "$ensaios" },
    // Etapa 3: Agrupar por ensaio e status
    {
      $group: {
        _id: {
          ensaio: "$ensaios",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    // Etapa 4: Reformatar o resultado
    {
      $group: {
        _id: "$_id.ensaio",
        statusCounts: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        ensaio: "$_id",
        statusCounts: 1,
      },
    },
  ]);

  return stats;
};

async function getOrdemDeServicoPorMes(){
  const stats = await OrdemDeServico.aggregate([
    // Etapa 1: Extrair o ano e mês do campo createdAt
    {
      $addFields: {
        ano: { $year: "$createdAt" },
        mes: { $month: "$createdAt" },
      },
    },
    // Etapa 2: Agrupar por ano e mês
    {
      $group: {
        _id: { ano: "$ano", mes: "$mes" },
        count: { $sum: 1 },
      },
    },
    // Etapa 3: Reordenar os resultados por ano e mês
    {
      $sort: {
        "_id.ano": 1,
        "_id.mes": 1,
      },
    },
    // Etapa 4: Formatar o resultado para facilitar a leitura
    {
      $project: {
        _id: 0,
        ano: "$_id.ano",
        mes: "$_id.mes",
        count: 1,
      },
    },
  ]);

  return stats;
};


