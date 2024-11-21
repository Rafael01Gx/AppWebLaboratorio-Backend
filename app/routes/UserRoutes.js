const router = require('express').Router()
const UserControler = require('../controllers/UserController')

//middleware
const verifyToken = require('../helpers/verify-token')
const {imageUpload} = require('../helpers/image-upload')
const {checkLevelAdm} = require('../helpers/check-user-level')

router.post('/sigin',UserControler.sigin)
router.post('/login',UserControler.login)
router.post('/forgot-password',UserControler.forgotPassword)
router.get('/checkuser',verifyToken,UserControler.checkUser)
router.get('/allusers',verifyToken,checkLevelAdm,UserControler.allUsers) // Rota ADMIN
router.get('/',verifyToken,UserControler.checkUser)
router.get('/:id',UserControler.getUserById)
router.patch('/edit/:id',verifyToken,UserControler.editUser)
router.patch('/reset-password',UserControler.resetPassword)
router.patch('/adm/edit/:id',verifyToken,checkLevelAdm,UserControler.editUserAdm)// Rota ADMIN
router.delete('/adm/delete/:id',verifyToken,checkLevelAdm,UserControler.deleteUserById)// Rota ADMIN





module.exports = router