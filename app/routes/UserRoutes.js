const router = require('express').Router()
const UserControler = require('../controllers/UserController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require('../helpers/image-upload')
const checkLevel = require('../helpers/check-user-level')

router.post('/sigin',UserControler.sigin)
router.post('/login',UserControler.login)
router.post('/forgot-password',UserControler.forgotPassword)
router.get('/checkuser',verifyToken,UserControler.checkUser)
router.get('/allusers',verifyToken,checkLevel,UserControler.allUsers) // Rota ADMIN
router.get('/',verifyToken,UserControler.checkUser)
router.get('/:id',UserControler.getUserById)
router.patch('/edit/:id',verifyToken,UserControler.editUser)
router.patch('/reset-password',UserControler.resetPassword)
router.patch('/adm/edit/:id',verifyToken,checkLevel,UserControler.editUserAdm)// Rota ADMIN
router.delete('/adm/delete/:id',verifyToken,checkLevel,UserControler.deleteUserById)// Rota ADMIN





module.exports = router