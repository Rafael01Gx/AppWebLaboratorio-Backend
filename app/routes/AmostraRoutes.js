const router = require('express').Router()
const AmostraController = require('../controllers/AmostraController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.patch('/editar/:id',verifyToken,checkLevel,AmostraController.editarAmostra) // Rota ADMIN
router.get('/listar-all',verifyToken,checkLevel,AmostraController.listarAmostras) // Rota ADMIN
router.get('/listar',verifyToken,AmostraController.listarAmostrasPorIdUsuario)
router.get('/listar/listar-by-os/:id',verifyToken,AmostraController.listarAmostrasPorOrdemDeServico)
router.delete('/deletar/:id',verifyToken,checkLevel,AmostraController.deletarAmostra) // Rota ADMIN


module.exports = router