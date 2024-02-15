const router = require('express').Router()
const ctrls = require('../controllers/product')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.put('/ratings', verifyAccessToken,ctrls.ratings)
router.post('/createProduct', verifyAccessToken,isAdmin, uploader.array('images', 10),ctrls.createProduct)
router.get('/',ctrls.getProducts)
router.get('/:pid', ctrls.getProduct)
router.put('/:pid', verifyAccessToken,isAdmin, uploader.array('images', 10), ctrls.updateProduct)
router.delete('/:pid', verifyAccessToken,isAdmin,ctrls.deleteProduct)
router.put('/uploadImg/:pid', verifyAccessToken,isAdmin, uploader.array('images', 10),ctrls.uploadImagesProduct)



module.exports = router