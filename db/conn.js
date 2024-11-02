const mongoose= require('mongoose')
const config = require('../config')
const { db_URL } = require('../config')


async function main() {
    await mongoose.connect(db_URL)
    console.log('Conectado ao banco de dados !')
}
main().catch((err)=>console.log('Erro ao conectar ao BD: ',err))

module.exports = mongoose 