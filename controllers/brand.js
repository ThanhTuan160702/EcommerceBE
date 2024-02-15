const Brand = require('../models/brand')
const asyncHandle = require('express-async-handler')

const createBrand = asyncHandle(async(req, res)=>{
    const title = req.body.title
    const check = await Brand.findOne({title})
    if(check) throw new Error('Brand is existed')
    const reponse = await Brand.create(req.body)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Add Brand is successfully" : "Something went wrong"
    })
})

const getBrand = asyncHandle(async(req, res)=>{
    const reponse = await Brand.find()
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse 
    })
})


const updateBrand = asyncHandle(async(req, res)=>{
    const title = req.body.title
    const check = await Brand.findOne({title})
    if(check) throw new Error('Brand is existed')
    const {cid} = req.params
    const reponse = await Brand.findByIdAndUpdate(cid, req.body, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Update Brand is successfully" : "Something went wrong"
    })
})

const deleteBrand = asyncHandle(async(req, res)=>{
    const {cid} = req.params
    const reponse = await Brand.findByIdAndDelete(cid)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Deleted is successfully" : "Something went wrong"
    })
})

module.exports = {
    createBrand,
    updateBrand,
    getBrand,
    deleteBrand
}