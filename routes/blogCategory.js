const router = require('express').Router()
const ctrls = require('../controllers/blogCategory')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/createBlogCategory', verifyAccessToken, isAdmin, ctrls.createBlogCategory)
router.put('/updateBlogCategory/:bid', verifyAccessToken, isAdmin, ctrls.updateBlogCategory)
router.get('/', ctrls.getBlogCategory)
router.delete('/deleteBlog/:bid', verifyAccessToken, isAdmin, ctrls.deleteBlogCategory)    



module.exports = router