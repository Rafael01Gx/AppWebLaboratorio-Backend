const router = require('express').Router()
const TipoDeAnaliseController = require('../controllers/TipoDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevel,TipoDeAnaliseController.novoTipoDeAnalise) // Rota ADMIN
router.patch('/editar/:id',verifyToken,checkLevel,TipoDeAnaliseController.editarTipoDeAnalise) // Rota ADMIN
router.get('/listar',verifyToken,checkLevel,TipoDeAnaliseController.listarTipoDeAnalise) // Rota ADMIN
router.delete('/deletar/:id',verifyToken,checkLevel,TipoDeAnaliseController.deletarTipoDeAnalise) // Rota ADMIN


module.exports = router