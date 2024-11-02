const router = require('express').Router()
const MateriaPrimaController = require('../controllers/MateriaPrimaController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevel,MateriaPrimaController.novaMateriaPrima) // Rota ADMIN
router.patch('/editar/:id',verifyToken,checkLevel,MateriaPrimaController.editarMateriaPrima) // Rota ADMIN
router.get('/listar',verifyToken,checkLevel,MateriaPrimaController.listarMateriaPrima) // Rota ADMIN
router.delete('/deletar/:id',verifyToken,checkLevel,MateriaPrimaController.deletarMateriaPrima) // Rota ADMIN


module.exports = router