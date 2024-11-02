const mongoose = require("../db/conn");
const { Schema } = mongoose;

const ConfiguracaoDeAnalise = mongoose.model(
  'ConfiguracaoDeAnalise',
  new Schema({
    tipo_de_analise: {
        type: new Schema({
            _id: { type: Schema.Types.ObjectId, ref: 'TipoDeAnalise', required: true },
            tipo: { type: String, required: true },
            classe: { type: String, required: true },
          },
          { _id: false }),
        required: true
      },
      materia_prima: {
        type: new Schema({
            _id: { type: Schema.Types.ObjectId, ref: 'MateriaPrima', required: true },
            nome_descricao: { type: String, required: true },
            classe_tipo: { type: String, required: true }
          }),
        required: true
      },
      parametros_de_analise: {
        type: Schema.Types.Mixed,
        required: true
      },
  }, { timestamps: true })
);

module.exports = ConfiguracaoDeAnalise;
