const router = require('express').Router()
const AnalyticalDataController = require('../controllers/AnalyticalDataController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelAdm } = require('../helpers/check-user-level')


router.get('/analytical-data',verifyToken,checkLevelAdm,AnalyticalDataController.getAnalytical) // Rota OP
router.get('/analytical-data-teste',verifyToken,checkLevelAdm,AnalyticalDataController.teste) // Rota OP



module.exports = router