const BlogCategory = require('../models/blogCategory')
const asyncHandle = require('express-async-handler')

const createBlogCategory = asyncHandle(async(req, res)=>{
    const reponse = await BlogCategory.create(req.body)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Add blog category is successfully" : "Something went wrong"
    })
})

const getBlogCategory = asyncHandle(async(req, res)=>{
    const reponse = await BlogCategory.find().select('title _id')
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse 
    })
})


const updateBlogCategory = asyncHandle(async(req, res)=>{
    const {bid} = req.params
    const reponse = await BlogCategory.findByIdAndUpdate(bid, req.body, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "update blog category is successfully" : "Something went wrong"
    })
})

const deleteBlogCategory = asyncHandle(async(req, res)=>{
    const {bid} = req.params
    const reponse = await BlogCategory.findByIdAndDelete(bid)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Deleted blog is successfully" : "Something went wrong"
    })
})

module.exports = {
    createBlogCategory,
    updateBlogCategory,
    getBlogCategory,
    deleteBlogCategory
}