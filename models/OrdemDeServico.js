const mongoose = require("../db/conn");
const { Schema } = mongoose;

const OrdemDeServico = mongoose.model(
  'OrdemDeServico',
  new Schema({
     numeroOs: {
      type: String,
      required: true
    },
    solicitante: {
      type: new Schema({
        _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: false }
      },
      { _id: false }),
      required: true
    },
    amostras: {
      type: Schema.Types.Mixed,
      required: true
    },
    observacao: {
      type: String,
      required: false
    },
    data_solicitacao: {
      type: String,
      required: true
    },
    data_recepcao: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: true,
      default: "Aguardando Autorização"
    },
    prazo_inicio_fim: {
      type: String,
      required: false,
    },
    observacao_adm: {
      type: String,
      required: false
    }
    
  }, { timestamps: true })
);

module.exports = OrdemDeServico;
