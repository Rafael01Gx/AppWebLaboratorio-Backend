const router = require('express').Router()
const OrdemDeServicoController = require('../controllers/OrdemDeServicoController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelAdm} = require('../helpers/check-user-level')


router.post('/criar',verifyToken,OrdemDeServicoController.novaOrdemDeServico) 
router.patch('/editar/:id',verifyToken,checkLevelAdm,OrdemDeServicoController.editarOrdemDeServicoAdm) // Rota ADMIN
router.get('/listar',verifyToken,OrdemDeServicoController.listarOrdemDeServicoUserId) 
router.get('/listar/todas',verifyToken,checkLevelAdm,OrdemDeServicoController.listarTodasOrdemsDeServico) // Rota ADMIN
router.get('/os-number/:os',verifyToken,OrdemDeServicoController.getOrdemDeServicoByOsNumber) 
router.delete('/deletar/:id',verifyToken,OrdemDeServicoController.deletarOrdemDeServico)
router.delete('/deletar/os/:id',verifyToken,checkLevelAdm,OrdemDeServicoController.deletarOrdemDeServicoAdm)// Rota ADMIN


module.exports = router