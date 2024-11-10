const mongoose = require("../../db/conn");
const { Schema } = mongoose;

const ParametrosDeAnalise = mongoose.model(
  "ParametrosDeAnalise",
  new Schema(
    {
      tipo_de_analise: {
        type: new Schema({
          _id: {
            type: Schema.Types.ObjectId,
            ref: "TipoDeAnalise",
            required: true,
          },
          tipo: { type: String, required: true },
          classe: { type: String, required: true },
        },
        { _id: false }
      ),
        
        required: true,
      },
      unidade_de_medida: {
        type: String,
        required: false,
      },
      descricao: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  )
);

module.exports = ParametrosDeAnalise;
