const mongoose = require("../../db/conn")
const { Schema } = mongoose

const User = mongoose.model(
    'User',
    new Schema({
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true,
            select:false
        },
        phone:{
            type: String,
            required: false
        },
        authorization:{
            type: Boolean,
            required: true,
            default: false,
        },
        
        // Administrador, Operador ou basic Usuário
        level:{
            type: String,
            required : true,
            default: "Usuário"
        },
        passwordResetToken:{
            type: String,
            select:false
        },
        passwordResetExpires:{
            type: Date,
            select:false
        },

    },{timestamps: true})
)
//Timestamps cria duas colunas , crição de dados e edição

module.exports = User