const router = require('express').Router()
const OrdemDeServicoController = require('../controllers/OrdemDeServicoController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/criar',verifyToken,OrdemDeServicoController.novaOrdemDeServico) 
router.patch('/editar/:id',verifyToken,checkLevel,OrdemDeServicoController.editarOrdemDeServicoAdm) // Rota ADMIN
router.get('/listar',verifyToken,OrdemDeServicoController.listarOrdemDeServicoUserId) 
router.get('/listar/todas',verifyToken,checkLevel,OrdemDeServicoController.listarTodasOrdemsDeServico) // Rota ADMIN
router.delete('/deletar/:id',verifyToken,OrdemDeServicoController.deletarOrdemDeServico)
router.delete('/deletar/os/:id',verifyToken,checkLevel,OrdemDeServicoController.deletarOrdemDeServicoAdm)// Rota ADMIN


module.exports = router