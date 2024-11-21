const router = require('express').Router()
const MateriaPrimaController = require('../controllers/MateriaPrimaController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelOp} = require('../helpers/check-user-level')


router.post('/criar',verifyToken,checkLevelOp,MateriaPrimaController.novaMateriaPrima) // Rota Op
router.patch('/editar/:id',verifyToken,checkLevelOp,MateriaPrimaController.editarMateriaPrima) // Rota Op
router.get('/listar',verifyToken,checkLevelOp,MateriaPrimaController.listarMateriaPrima) // Rota Op
router.delete('/deletar/:id',verifyToken,checkLevelOp,MateriaPrimaController.deletarMateriaPrima) // Rota Op


module.exports = router