const router = require('express').Router()
const ParametrosDeAnaliseController = require('../controllers/ParametrosDeAnaliseController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevel,ParametrosDeAnaliseController.novoParametroDeAnalise) // Rota ADMIN
router.patch('/editar/:id',verifyToken,checkLevel,ParametrosDeAnaliseController.editarParametroDeAnalise) // Rota ADMIN
router.get('/listar',verifyToken,checkLevel,ParametrosDeAnaliseController.listarParametroAnalise) // Rota ADMIN
router.delete('/deletar/:id',verifyToken,checkLevel,ParametrosDeAnaliseController.deletarParametroAnalise) // Rota ADMIN


module.exports = router