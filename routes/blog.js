const router = require('express').Router()
const ctrls = require('../controllers/blog')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/createBlog', verifyAccessToken, ctrls.createBlog)
router.get('/', verifyAccessToken,isAdmin, ctrls.getBlogs)
router.get('/getBlog/:bid', ctrls.getBlog)
router.put('/updateBlog/:bid', verifyAccessToken,isAdmin, ctrls.updateBlog)
router.delete('/deleteBlog/:bid', verifyAccessToken,isAdmin, ctrls.deleteBlog)
router.put('/like/:bid', verifyAccessToken, ctrls.likeBlog)
router.put('/dislike/:bid', verifyAccessToken, ctrls.dislikeBlog)
router.put('/uploadimg/:bid', verifyAccessToken, uploader.single('image'),ctrls.uploadImageBlog)


module.exports = router