const router = require('express').Router()
const ctrls = require('../controllers/order')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')



router.post('/',verifyAccessToken, ctrls.createOrder)
router.put('/updatestatus/:oid',verifyAccessToken, isAdmin,ctrls.updateStatus)
router.get('/getOrders',verifyAccessToken, isAdmin,ctrls.getOrders)
router.get('/getUserOrder',verifyAccessToken,ctrls.getUserOrder)
router.delete('/deleteOrder/:oid',verifyAccessToken,ctrls.deleteOrder)

module.exports = router