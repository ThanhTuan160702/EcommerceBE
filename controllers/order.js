const Order = require('../models/order')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandle = require('express-async-handler')

const createOrder = asyncHandle(async(req, res)=>{
    const { _id } = req.user
    const { products, total, address, mobile } = req.body
    await User.findByIdAndUpdate(_id, {cart: []},{new: true})
    const rs = await Order.create({ products, total, orderBy: _id, address, mobile })
    return res.status(200).json({
        success: rs ? true : false,
        mes: rs ? rs : "Something went wrong"
    })
})

const updateStatus = asyncHandle(async(req, res)=>{
    const { oid } = req.params
    const update = req.body.update
    if(!update) throw new Error('Missing Input')
    const rs = await Order.findByIdAndUpdate(oid, {status: update}, {new: true})
    return res.status(200).json({
        success: rs ? true : false,
        mes: rs ? "Update is successfully" : "Something went wrong"
    })
})

const getOrders = asyncHandle(async(req, res)=>{
    const queries = { ...req.query }
    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(element => delete queries[element])
    // Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    let formatedQueries = JSON.parse(queryString)
    if (queries?.status) formatedQueries.status = { $regex: queries.status, $options: 'i' }
    const query = { ...formatedQueries }

    const counts = await Order.find(query).countDocuments();

    let queryCommand = Order.find(query).populate({
        path: 'products',
        populate: {
            path: 'product',
            select: 'title images price category'
        }
    }).populate({
        path: 'orderBy',
        select: 'firstname lastname'
    })

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    // Pagination
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)

    // Execute query
    const response = await queryCommand.exec()

    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Something went wrong",
        counts
    })
})

const getUserOrder = asyncHandle(async(req, res)=>{
    const { _id } = req.user
    const queries = { ...req.query }
    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(element => delete queries[element])
    // Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    let formatedQueries = JSON.parse(queryString)
    if (queries?.status) formatedQueries.status = { $regex: queries.status, $options: 'i' }
    const query = { ...formatedQueries , orderBy: _id }

    const counts = await Order.find(query).countDocuments();

    let queryCommand = Order.find(query).populate({
        path: 'products',
        populate: {
            path: 'product',
            select: 'title images price category'
        }
    });

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    // Pagination
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)

    // Execute query
    const response = await queryCommand.exec()
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Something went wrong",
        counts
    })
})

const deleteOrder = asyncHandle(async(req,res)=>{
    const { oid } = req.params
    const response = await Order.findByIdAndDelete(oid)
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? 'Delete is successfully' : 'Something went wrong'
    })
})

module.exports = {
    createOrder,
    updateStatus,
    getOrders,
    getUserOrder,
    deleteOrder
}