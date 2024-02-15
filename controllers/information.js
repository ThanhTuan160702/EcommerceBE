const Information = require('../models/information')
const asyncHandle = require('express-async-handler')

const createInformation = asyncHandle(async(req, res)=>{
    const { title, description } = req.body
    const response = await Information.create(req.body)
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Add information is successfully" : "Something went wrong"
    })
})

const getInformation = asyncHandle(async(req, res)=>{
    const {title} = req.query
    const response = await Information.findOne({title})
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Something went wrong"
    })
})

module.exports = {
    createInformation,
    getInformation
}