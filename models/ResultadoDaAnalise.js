const mongoose = require("../db/conn");
const { Schema } = mongoose;

const ResultadoDaAnalise = mongoose.model(
  'ResultadoDaAnalise',
  new Schema({
    ordemDeServico: {
      type: Schema.Types.Mixed,
      required: true
    },
    data_analise: {
      type: Schema.Types.Mixed,
      required: true
    },
    resultado:{
      type: Schema.Types.Mixed,
      required: true
    }
  }, { timestamps: true })
);

module.exports = ResultadoDaAnalise;
