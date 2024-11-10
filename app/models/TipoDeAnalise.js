const mongoose = require("../../db/conn");
const { Schema } = mongoose;

const TipoDeAnalise = mongoose.model(
  'TipoDeAnalise',
  new Schema({
    tipo: {
      type: String,
      required: true
    },
    classe:{
      type: String,
      required: true
    }
  }, { timestamps: true })
);

module.exports = TipoDeAnalise;
