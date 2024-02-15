const router = require('express').Router()
const ctrls = require('../controllers/coupon')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/createCoupon', verifyAccessToken, isAdmin, ctrls.createCoupon)
router.put('/updateCoupon/:cid', verifyAccessToken, isAdmin, ctrls.updateCoupon)
router.get('/', ctrls.getCoupon)
router.delete('/delete/:cid', verifyAccessToken, isAdmin, ctrls.deleteCoupon)    



module.exports = router