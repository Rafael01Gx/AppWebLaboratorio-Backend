const router = require('express').Router()
const AmostraController = require('../controllers/AmostraController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelAdm ,checkLevelOp} = require('../helpers/check-user-level')


router.patch('/editar/:id',verifyToken,checkLevelOp,AmostraController.editarAmostra) // Rota OP
router.get('/listar-all',verifyToken,checkLevelOp,AmostraController.listarAmostras) // Rota OP
router.get('/listar',verifyToken,AmostraController.listarAmostrasPorIdUsuario)
router.get('/listar/listar-by-os/:id',verifyToken,AmostraController.listarAmostrasPorOrdemDeServico)
router.delete('/deletar/:id',verifyToken,checkLevelAdm,AmostraController.deletarAmostra) // Rota ADMIN


module.exports = router