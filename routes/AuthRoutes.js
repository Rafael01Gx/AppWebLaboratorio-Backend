const router = require('express').Router()
const AuthControler = require('../controllers/AuthController')

//middleware
const verifyToken = require('../helpers/verify-token')
const checkLevel = require('../helpers/check-user-level')


router.post('/verify-token',AuthControler.verifyToken)


module.exports = router