const router = require('express').Router()
const ConfiguracaoDeAnaliseController = require('../controllers/ConfiguracaoDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelOp} = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevelOp,ConfiguracaoDeAnaliseController.novoConfiguracaoDeAnalise) // Rota Op
router.patch('/editar/:id',verifyToken,checkLevelOp,ConfiguracaoDeAnaliseController.editarConfiguracaoDeAnalise) // Rota Op
router.get('/listar',verifyToken,checkLevelOp,ConfiguracaoDeAnaliseController.listarConfiguracaoDeAnalise) // Rota Op
router.delete('/deletar/:id',verifyToken,checkLevelOp,ConfiguracaoDeAnaliseController.deletarConfiguracaoDeAnalise) // Rota Op


module.exports = router