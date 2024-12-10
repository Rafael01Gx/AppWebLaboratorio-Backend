const router = require('express').Router()
const AnalyticalDataController = require('../controllers/AnalyticalDataController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {checkLevelOp } = require('../helpers/check-user-level')


router.get('/analytical-data',verifyToken,checkLevelOp,AnalyticalDataController.getAnalytical) // Rota OP




module.exports = router