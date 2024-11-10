const router = require('express').Router()
const ConfiguracaoDeAnaliseController = require('../controllers/ConfiguracaoDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevel,ConfiguracaoDeAnaliseController.novoConfiguracaoDeAnalise) // Rota ADMIN
router.patch('/editar/:id',verifyToken,checkLevel,ConfiguracaoDeAnaliseController.editarConfiguracaoDeAnalise) // Rota ADMIN
router.get('/listar',verifyToken,checkLevel,ConfiguracaoDeAnaliseController.listarConfiguracaoDeAnalise) // Rota ADMIN
router.delete('/deletar/:id',verifyToken,checkLevel,ConfiguracaoDeAnaliseController.deletarConfiguracaoDeAnalise) // Rota ADMIN


module.exports = router