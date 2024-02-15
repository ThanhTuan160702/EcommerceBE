const Blog = require('../models/blog')
const asyncHandle = require('express-async-handler')

const createBlog = asyncHandle(async(req, res)=>{
    const {title, description, category} = req.body
    if(!title || !description || !category){
        throw new Error('Missing input')
    }
    const reponse = await Blog.create(req.body)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Add blog is successfully" : "Something went wrong"
    })
})

const getBlogs = asyncHandle(async(req, res)=>{
    const reponse = await Blog.find()
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse 
    })
})

const updateBlog = asyncHandle(async(req, res)=>{
    const { bid } = req.params
    const reponse = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Update blog is successfully" : "Something went wrong" 
    })
})

const deleteBlog = asyncHandle(async(req, res)=>{
    const { bid } = req.params
    const reponse = await Blog.findByIdAndDelete(bid, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Delete blog is successfully" : "Something went wrong" 
    })
})

const likeBlog = asyncHandle(async(req, res)=>{
    const {_id} = req.user
    const {bid} = req.params
    if(!bid) throw new Error("Missing Input")
    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog?.dislikes?.find(ele=>ele.toString() === _id)
    console.log(blog?.likes)
    if(alreadyDisliked){
        const response  = await Blog.findByIdAndUpdate(bid,{$pull: {dislikes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }
    const isLiked = blog?.likes?.find(ele=>ele.toString() === _id)
    if(isLiked){
        const response = await Blog.findByIdAndUpdate(bid,{$pull: {likes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }else{
        const response = await Blog.findByIdAndUpdate(bid,{$push: {likes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }
})

const dislikeBlog = asyncHandle(async(req, res)=>{
    const {_id} = req.user
    const {bid} = req.params
    if(!bid) throw new Error("Missing Input")
    const blog = await Blog.findById(bid)
    const alreadyLiked = blog?.likes?.find(ele=>ele.toString() === _id)
    if(alreadyLiked){
        const response  = await Blog.findByIdAndUpdate(bid,{$pull: {likes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }
    const isDisiked = blog?.dislikes?.find(ele=>ele.toString() === _id)
    if(isDisiked){
        const response = await Blog.findByIdAndUpdate(bid,{$pull: {dislikes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }else{
        const response = await Blog.findByIdAndUpdate(bid,{$push: {dislikes: _id}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response 
        })
    }
})

const getBlog = asyncHandle(async(req, res)=>{
    const { bid } = req.params
    // $inc : tăng lên 1 đơn vị
    const blog = await Blog.findByIdAndUpdate(bid, { $inc: {numberViewer: 1} }, {new: true}).populate('likes','firstname lastname').populate('dislikes','firstname lastname')
    return res.status(200).json({
        success: blog ? true : false,
        mes: blog 
    })
})

const uploadImageBlog = asyncHandle(async(req, res)=>{
    const { bid } = req.params
    if( !req.file ) throw new Error('Missing Input')
    const response = await Blog.findByIdAndUpdate(bid, {image: req.file.path},{new: true})
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Upload is successfully" : "Something went wrong"
    })
})

module.exports = {
    createBlog,
    getBlogs,
    updateBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    getBlog,
    uploadImageBlog
}