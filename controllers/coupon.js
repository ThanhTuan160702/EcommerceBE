const Coupon = require('../models/coupon')
const asyncHandle = require('express-async-handler')

const createCoupon = asyncHandle(async(req, res)=>{
    const { name, discount, expiry } = req.body
    if(!name || !discount || !expiry){
        throw new Error("Missing input")
    }
    const check = await Coupon.findOne({name})
    if(check) throw new Error('Coupon is existed')
    const reponse = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry*24*60*60*1000
})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Add Coupon is successfully" : "Something went wrong"
    })
})

const getCoupon = asyncHandle(async(req, res)=>{
    const reponse = await Coupon.find().select('-createdAt -updatedAt')
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse 
    })
})


const updateCoupon = asyncHandle(async(req, res)=>{
    const name = req.body.name
    const {cid} = req.params
    if(req.body.expiry){
        req.body.expiry = Date.now() + +req.body.expiry*24*60*60*1000
    }
    const reponse = await Coupon.findByIdAndUpdate(cid, req.body, {new: true})
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Update Coupon is successfully" : "Something went wrong"
    })
})

const deleteCoupon = asyncHandle(async(req, res)=>{
    const {cid} = req.params
    const reponse = await Coupon.findByIdAndDelete(cid)
    return res.status(200).json({
        success: reponse ? true : false,
        mes: reponse ? "Deleted is successfully" : "Something went wrong"
    })
})

module.exports = {
    createCoupon,
    updateCoupon,
    getCoupon,
    deleteCoupon
}