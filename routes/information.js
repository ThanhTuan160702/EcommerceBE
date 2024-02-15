const router = require('express').Router()
const ctrls = require('../controllers/information')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/createInformation', verifyAccessToken, isAdmin, ctrls.createInformation)
router.get('/getInformation', verifyAccessToken, isAdmin, ctrls.getInformation)



module.exports = router