const mongoose = require("../../db/conn");
const { Schema } = mongoose;

const Amostra = mongoose.model(
  'Amostras',
  new Schema({
    numeroOs:{
      type: String,
      required: true
    },
    nome_amostra: {
        type: String,
        required: true
      },
      data_amostra: {
        type: String,
        required: true
      },
    ensaios_solicitados: {         
      type: String,
      required: true
    },
    amostra_tipo: {         
      type: String,
      required: false,
      default: "Não definido"
    },
    solicitante: {
        type: new Schema({
          _id: { type: Schema.Types.ObjectId, required: true },
          name: { type: String, required: true },
          email: { type: String, required: true },
          phone: { type: String, required: false },
          area: { type: String, required: false },
          funcao: { type: String, required: false }
        },
        { _id: false }),
        required: true
      },
      resultados: {
        type: Schema.Types.Mixed,
        required: false
      },
      analistas: {
        type: Schema.Types.Mixed,
        required: false
      },
      status: {
        type: String,
        required: true,
        default: "Aguardando Autorização"
      },
      progresso: {
        type: Number,
        required: false,
        default: 0
      },
      prazo_inicio_fim: {
        type: String,
        required: false,
        default: "Aguardando"
      },
      data_recepcao: {
        type: String,
        required: false,
        default: "Aguardando"
      }
  }, { timestamps: true })
);

module.exports = Amostra;
