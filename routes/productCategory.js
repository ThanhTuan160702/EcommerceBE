const router = require('express').Router()
const ctrls = require('../controllers/productCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/createCategory', verifyAccessToken, isAdmin, ctrls.createCategory)
router.put('/updateCategory/:cid', verifyAccessToken, isAdmin, ctrls.updateCategory)
router.get('/', ctrls.getCategory)
router.delete('/delete/:cid', verifyAccessToken, isAdmin, ctrls.deleteCategory)    



module.exports = router