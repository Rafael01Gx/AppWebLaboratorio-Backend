const router = require('express').Router()
const TipoDeAnaliseController = require('../controllers/TipoDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelOp} = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevelOp,TipoDeAnaliseController.novoTipoDeAnalise) // Rota Op
router.patch('/editar/:id',verifyToken,checkLevelOp,TipoDeAnaliseController.editarTipoDeAnalise) // Rota Op
router.get('/listar',verifyToken,checkLevelOp,TipoDeAnaliseController.listarTipoDeAnalise) // Rota Op
router.delete('/deletar/:id',verifyToken,checkLevelOp,TipoDeAnaliseController.deletarTipoDeAnalise) // Rota Op


module.exports = router