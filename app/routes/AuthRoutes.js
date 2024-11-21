const router = require('express').Router()
const AuthControler = require('../controllers/AuthController')

//middleware
const verifyToken = require('../helpers/verify-token')


router.post('/verify-token',AuthControler.verifyToken)


module.exports = router