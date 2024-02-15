const router = require('express').Router()
const ctrls = require('../controllers/brand')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/createBrand', verifyAccessToken, isAdmin, ctrls.createBrand)
router.put('/updateBrand/:cid', verifyAccessToken, isAdmin, ctrls.updateBrand)
router.get('/', ctrls.getBrand)
router.delete('/delete/:cid', verifyAccessToken, isAdmin, ctrls.deleteBrand)    



module.exports = router