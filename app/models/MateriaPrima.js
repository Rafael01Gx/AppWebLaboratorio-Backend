const mongoose = require("../../db/conn");
const { Schema } = mongoose;

const MateriaPrima = mongoose.model(
  'MateriaPrima',
  new Schema({
    nome_descricao: {
        type: String,
        required: true
      },
    classe_tipo: {         
      type: String,
      required: true
    }
  }, { timestamps: true })
);

module.exports = MateriaPrima;
