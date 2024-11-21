const router = require('express').Router()
const ParametrosDeAnaliseController = require('../controllers/ParametrosDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelOp} = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevelOp,ParametrosDeAnaliseController.novoParametroDeAnalise) // Rota Op
router.patch('/editar/:id',verifyToken,checkLevelOp,ParametrosDeAnaliseController.editarParametroDeAnalise) // Rota Op
router.get('/listar',verifyToken,checkLevelOp,ParametrosDeAnaliseController.listarParametroAnalise) // Rota Op
router.delete('/deletar/:id',verifyToken,checkLevelOp,ParametrosDeAnaliseController.deletarParametroAnalise) // Rota Op


module.exports = router