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
        area:{
            type: String,
            required: false
        },
        funcao:{
            type: String,
            required: false
        },
        authorization:{
            type: Boolean,
            required: true,
            default: false,
        },
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
        notifications: [new Schema({
            title: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            },
            data: {
                type: String,
                required: true
            },
            read: {
                type: Boolean,
                default: false
            }
        })]

    },{timestamps: true})
)
//Timestamps cria duas colunas , crição de dados e edição

module.exports = User