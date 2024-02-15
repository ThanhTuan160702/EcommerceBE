const { response } = require('express')
const ProductCategory = require('../models/productCategory')
const asyncHandle = require('express-async-handler')

const createCategory = asyncHandle(async(req, res)=>{
    const title = req.body.title
    const check = await ProductCategory.findOne({title})
    if(check) throw new Error('Category is existed')
    const reponse = await ProductCategory.create(req.body)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Add category is successfully" : "Something went wrong"
    })
})

const getCategory = asyncHandle(async(req, res)=>{
    const response = await ProductCategory.find()
    return res.status(200).json({
        success: response ? true : false,
        mes: response 
    })
})


const updateCategory = asyncHandle(async(req, res)=>{
    const title = req.body.title
    const check = await ProductCategory.findOne({title})
    if(check) throw new Error('Category is existed')
    const {cid} = req.params
    console.log(cid)
    const reponse = await ProductCategory.findByIdAndUpdate(cid, req.body, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "update category is successfully" : "Something went wrong"
    })
})

const deleteCategory = asyncHandle(async(req, res)=>{
    const {cid} = req.params
    const reponse = await ProductCategory.findByIdAndDelete(cid)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Deleted is successfully" : "Something went wrong"
    })
})

module.exports = {
    createCategory,
    updateCategory,
    getCategory,
    deleteCategory
}