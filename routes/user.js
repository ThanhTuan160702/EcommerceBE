const router = require('express').Router()
const ctrls = require('../controllers/user')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')


router.post('/register', ctrls.register)
router.get('/final-register/:token', ctrls.finalRegister)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken,ctrls.getCurrent)
router.post('/refreshtoken', ctrls.refreshAccessToken)
router.get('/logout',ctrls.logout)
router.post('/forgotpassword',ctrls.forgotPassword)
router.put('/resetpassword',ctrls.resetPassword)
router.get('/', verifyAccessToken,isAdmin,ctrls.getUsers)
router.delete('/', verifyAccessToken,isAdmin,ctrls.deleteUser)
router.put('/updateUser', verifyAccessToken,uploader.single('avatar'),ctrls.updateUser)
router.put('/updateUserByAdmin/:uid', verifyAccessToken, isAdmin,ctrls.updateUserByAdmin)
router.put('/updateaddressuser/:uid', verifyAccessToken,ctrls.updateAddressUser)
router.put('/updatecart', verifyAccessToken,ctrls.updateCart)
router.put('/deletecart/:pid', verifyAccessToken,ctrls.deleteCart)


module.exports = router

//Create (POST) + PUT - body
//Get + Delete - query