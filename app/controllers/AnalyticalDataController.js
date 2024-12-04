const Amostra = require("../models/Amostra");
const OrdemDeServico = require("../models/OrdemDeServico");

module.exports = class AnalyticalDataController {
  static async getAnalytical(req, res) {
    const os_analytics = await getOrdemDeServicoStats();
    const ensaios_analytics = await getTotalEnsaiosPorData();

    res.status(200).json({ os_analytics, ensaios_analytics });
  }

};

async function getOrdemDeServicoStats() {
  const aggregateData = async (matchCriteria, dateField) => {
    return await OrdemDeServico.aggregate([
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
  };

  const [ordensDeServicosTotais, ordensDeServicoFinalizadas] =
    await Promise.all([
      aggregateData({}, "createdAt"),
      aggregateData({ status: "Finalizada" }, "updatedAt"),
    ]);

  const total = ordensDeServicosTotais.map((item) => item.quantidade);
  const finalizadas = ordensDeServicoFinalizadas.map((item) => item.quantidade);

  const datas = Array.from(
    new Set([
      ...ordensDeServicosTotais.map((item) => `${item.month}/${item.year}`),
      ...ordensDeServicoFinalizadas.map((item) => `${item.month}/${item.year}`),
    ])
  ).sort();

  return {
    total,
    finalizadas,
    datas,
  };
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

  const ensaios_analytics = stats.map((item) => [
    item.data,
    item.numero_total_de_ensaios,
  ]);

  return ensaios_analytics;
}

