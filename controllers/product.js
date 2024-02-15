const Product = require('../models/product')
const asyncHandle = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandle(async(req, res)=>{
    const {title, price, description, brand, category, color} = req.body
    const images = req.files?.map(el => el.path)
    if(!(title && price && description && brand && category && color)) throw new Error('Missing Input')
    let random = Math.floor(Math.random() * 1500);
    req.body.slug = slugify(title) + '-' + random
    if(images) req.body.images = images
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        mes: newProduct ? 'Add product successfully!' : "Something went wrong"
    })
})

const getProduct = asyncHandle(async(req, res)=>{
    const {pid} = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
            success: product ? true : false,
            mes: product ? product : "Something went wrong"
    })
})

const getProducts = asyncHandle(async(req, res) => {
    const queries = { ...req.query }
    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(element => delete queries[element])
    // Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    let formatedQueries = JSON.parse(queryString)
    let colorQueryObject = {}

    // Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' }
    if (typeof queries.variant === 'boolean') formatedQueries.variant = queries.variant
    if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' }
    if (queries?.brand) formatedQueries.brand = { $regex: queries.brand, $options: 'i' }
    if (queries?.color) {
        delete formatedQueries.color
        const colorArray = queries.color.split(',')
        const colorQuery = colorArray.map(el => ({ color: { $regex: el, $options: 'i' } }))
        colorQueryObject = { $or: colorQuery }
    }
    const q = { ...colorQueryObject, ...formatedQueries }


    // Đếm số lượng documents trước khi biến đổi query
    const counts = await Product.find(q).countDocuments();

    // Tạo query command từ query biến đổi
    let queryCommand = Product.find(q);

    if (queries?.totalRatings) {
        queryCommand = queryCommand.where({ totalRatings: queries.totalRatings });
    }

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    // Fields limiting
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
    const response = await queryCommand.exec();

    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Something went wrong",
        counts
    });
});

const updateProduct = asyncHandle(async(req, res)=>{
    const { pid } = req.params
    const files = req?.files
    if(files){
        req.body.images = files?.map(el => el.path)
    }
    if(req.body.title){
        let random = Math.floor(Math.random() * 1500);
        req.body.slug = slugify(req.body.title) + '-' + random
    }
    const UpdatedProduct = await Product.findByIdAndUpdate(pid,req.body,{new: true})
    return res.status(200).json({
        success: UpdatedProduct ? true : false,
        mes: UpdatedProduct ? 'Update is successfully' : "Something went wrong"
    })
})

const deleteProduct = asyncHandle(async(req, res)=>{
    const {pid} = req.params
    const products = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: products ? true : false,
        mes: products ? "Deleted is successfully" : "Something went wrong"
    })
})

const ratings = asyncHandle(async(req, res)=>{
    const {_id} = req.user
    const {star, comment, pid} = req.body
    if(!star || !pid) throw new Error('Missing input')
    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id)
    if(alreadyRating){
        //Update rating
        // Tìm ra object nào giống với object cần tìm
        await Product.updateOne({
            ratings: { $elemMatch: alreadyRating }},
            {$set: { "ratings.$.star":star, "ratings.$.comment":comment }}
        ,{new: true})
    }else{
        //Add rating
       await Product.findByIdAndUpdate(pid, { $push: {ratings: {star, comment, postedBy: _id}} },{new: true})
    }

    const updateProduct = await Product.findById(pid)
    const ratingCount = updateProduct.ratings.length
    const sumRating = updateProduct.ratings.reduce((sum, ele)=> sum + +ele.star, 0)
    updateProduct.totalRatings = Math.round(sumRating * 10 / ratingCount) / 10

    await updateProduct.save()

    return res.status(200).json({
        success: true,
        mes: updateProduct
    })
})

const uploadImagesProduct = asyncHandle(async(req, res)=>{
    const { pid } = req.params
    if( !req.files ) throw new Error('Missing Input')
    const response = await Product.findByIdAndUpdate(pid, {$push: {images: {$each: req.files.map(el => el.path)}}},{new: true})
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Upload is successfully" : "Something went wrong"
    })
})

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
    uploadImagesProduct
}