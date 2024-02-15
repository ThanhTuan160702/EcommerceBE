const User = require('../models/user')
const FinalRegister = require('../models/finalregister')
const asyncHandle = require('express-async-handler')
const {gennerateAccessToken, gennerateRefreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const sendMail = require('../untils/sendMail')
const crypto = require('crypto')
const makeToken = require('uniqid')
const { error } = require('console')
const bcrypt = require('bcrypt')

/*const register = asyncHandle(async(req,res) => {
    const { email , password, firstname, lastname } = req.body
    if(!email || !password || !firstname || !lastname){
        return res.status(400).json({
            success: false,
            mes: "Missing input"
        })
    }

    const user = await User.findOne({email})
    if(user){
        throw new Error('User has existed!')
    }else{
        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mes: newUser ? "Rigster is successfully" : "Something went wrong"
        })
    }
})*/

const register = asyncHandle(async(req, res)=>{
    const { email, password, firstname, lastname } = req.body
    if(!email || !password || !firstname || !lastname){
        return res.status(400).json({
            success: false,
            mes: "Missing input!"
        })
    }
    const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)
    if(checkEmail === false){
        return res.status(400).json({
            success: false,
            mes: "Invalid email!"
        }) 
    }
    if(req.body.password.length < 6){
        return res.status(400).json({
            success: false,
            mes: "Password must have more than 6 characters!"
        }) 
    }
    const userFinalRegister = await FinalRegister.findOne({email})
    if(userFinalRegister){
        return res.status(400).json({
            success: false,
            mes: "Please check mail for register!"
        })
    }
    const user = await User.findOne({email})
    if(user){
        return res.status(400).json({
            success: false,
            mes: "User has exists!"
        })
    }else{
        const token = makeToken()
        await FinalRegister.create({email, password, firstname, lastname, token})
        const html = `Click vào link để hoàn tất quá trình đăng ký của bạn.Link này sẽ hết hạn sau 15 phút <a href=${process.env.URL_SERVER}/api/user/final-register/${token}>Click here</a>`  
        await sendMail({email, html, subject: 'Final Register'})
        return res.status(200).json({
            success: true,
            mes: "Please check your email to active account"
        })
    }
})

const finalRegister = asyncHandle(async(req, res)=>{
    const { token } = req.params
    const token2 = await FinalRegister.findOne({token: token})
    if(!token2){
        return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`)
    }else{
        const newUser = await User.create({
            email: token2?.email,
            password: token2?.password,
            firstname: token2?.firstname,
            lastname: token2?.lastname
        })
        await FinalRegister.findByIdAndDelete(token2._id)
        if(newUser){
            return res.redirect(`${process.env.CLIENT_URL}/finalregister/success`)
        }else{
            return res.redirect(`${process.env.CLIENT_URL}/finalregister/failed`)
        }
    }
})

//RefreshToken cấp mới accesstoken
//AccessToken xác thực người, phân quyền người dùng

const login = asyncHandle(async(req,res) => {
    const { email , password} = req.body
    if(!email || !password ){
        return res.status(400).json({
            success: false,
            mes: "Missing input"
        })
    }
    const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)
    if(checkEmail === false){
        return res.status(400).json({
            success: false,
            mes: "Invalid email"
        }) 
    }

    const user = await User.findOne({email})
    if(user && await user.isCorrectPassword(password)){
        //Không hiện password, role ra 
        const {password, role, refreshToken,...userData} = user.toObject()
        const accessToken = gennerateAccessToken(user._id, role)
        const newRefreshToken = gennerateRefreshToken(user._id)
        //Lưu refreshToken vào database
        await User.findByIdAndUpdate(user._id, {refreshToken: newRefreshToken}, {new: true})
        //Lưu refreshToken vào cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true, 
            maxAge: 7*24*60*60*1000, // Thời gian sống của cookie, ở đây là 7 ngày tính bằng mili giây
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    }else{
        return res.status(400).json({
            success: false,
            mes: "Invalid credentials!"
        })
    }
})

const getCurrent = asyncHandle(async(req,res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password').populate({
        path: 'cart',
        populate: {
            path: 'product',
            select: 'title images price category'
        }
    })
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandle(async(req, res, )=>{
    //Lấy token từ cookie
    const cookie = req.cookies
    console.log(cookie)
    //Check xem có token hay không
    if(!cookie && !cookie.refreshToken){
        throw new Error('No refresh Token in cookies')
    }else{
        //Check token có hợp lệ hay không
        const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
        const response = await User.findOne({_id: rs._id, refreshToken: cookie.refreshToken})
        return res.status(200).json({
            success: response ? true : false,
            newAccessToken: response ? gennerateAccessToken(response._id, response.role) : "Refresh token not matched"
        })
        
    }
})

const logout = asyncHandle(async(req, res)=>{
   const cookie = req.cookies
   if(!cookie || !cookie.refreshToken){
    throw new Error("No refresh token in cookies")
   }else{
    //Xóa refreshToken ở db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken},{refreshToken: ''}, {new: true})
    //Xóa refreshToken ở cookie trình duyệt
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })
   }
})
//Client gửi email, Server check email có hợp lệ không => gửi mail + link password change token
const forgotPassword = asyncHandle(async(req, res)=>{
    const {email} = req.body
    if(!email) throw new Error('Missing Email')
    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json({
            success: false,
            mes: 'User not found!'
        })
    }
    const resetToken = user.createPasswordChangeToken()
    await user.save()

    const html = `Click vào link để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút <a href=${process.env.CLIENT_URL}/reset-password/${resetToken}>Click here</a>`

    const data = {
        email,
        html,
        subject: 'Forgot Password'
    }
    const rs = await sendMail(data)
    return res.status(200).json({
        success: rs.response.includes('OK') ? true : false,
        mes: rs.response.includes('OK') ? 'Please check mail for change password' : 'Change password is failed'
    })
})

const resetPassword = asyncHandle(async(req, res) => {
    const { password, token } = req.body
    if(!password || !token) throw new Error('Missing password or token')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({passwordResetToken, passwordResetExpire: {$gt: Date.now()}})
    if(!user){
        throw new Error("Invalid reset token")
    }else{
        const salt = bcrypt.genSaltSync(10)
        resetpassword = await bcrypt.hash(password, salt)
        user.password = resetpassword
        user.passwordResetToken = undefined
        user.passwordChangeAt = Date.now()
        user.passwordResetExpire = undefined
        await user.save()
        return res.status(200).json({
            success: user ? true : false,
            mes: user ? user : "Something went wrong"
        })
    }
})

const getUsers = asyncHandle(async(req, res) => {
    const queries = { ...req.query }
    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(element => delete queries[element])
    // Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, matchedEl => `$${matchedEl}`)
    let formatedQueries = JSON.parse(queryString)

    // Filtering
    if (queries?.email) formatedQueries.email = { $regex: queries.email, $options: 'i' }

    // Đếm số lượng documents trước khi biến đổi query
    const counts = await User.find(formatedQueries).countDocuments();

    // Tạo query command từ query biến đổi
    let queryCommand = User.find(formatedQueries);

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
    const limit = +req.query.limit
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)

    // Execute query
    const response = await queryCommand.exec();

    return res.status(200).json({
        success: response ? true : false,
        mes: response ? response : "Something went wrong",
        counts
    });
})

const deleteUser = asyncHandle(async(req, res) => {
    const {_id} = req.query
    console.log(_id)
    if(!_id){
        throw new Error('Missing input')
    }
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Deleted successfully" : "Something went wrong"
    })
})

const updateUser = asyncHandle(async(req, res) => {
    const {_id} = req.user
    const { firstname, lastname, mobile, address } = req.body
    const data = { firstname, lastname, mobile, address }
    if(req.file) data.avatar = req.file.path
    if(!_id || Object.keys(req.body).length === 0){
        throw new Error('Missing input')
    }
    const response = await User.findByIdAndUpdate(_id, data, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Updated successfully" : "Something went wrong"
    })
})

const updateUserByAdmin = asyncHandle(async(req, res) => {
    const { uid } = req.params
    if(Object.keys(req.body).length === 0){
        throw new Error('Missing input')
    }
    const response = await User.findByIdAndUpdate(uid, req.body, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Updated successfully" : "Something went wrong"
    })
})

const updateAddressUser = asyncHandle(async(req, res) => {
    const { _id } = req.user
    if(!req.body.address){
        throw new Error('Missing Input')
    }
    const response = await User.findByIdAndUpdate(_id, {$push : {address: req.body.address}}, {new: true})
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Updated successfully" : "Something went wrong"
    })
})


const updateCart = asyncHandle(async(req, res) => {
    const { _id } = req.user
    const { pid, quantity = 1, color } = req.body
    if(!pid || !color) {
        throw new Error("Missing Input")
    }
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el=> el.product.toString() === pid)
    if(alreadyProduct){
        const response = await User.updateOne({cart: {$elemMatch: alreadyProduct}},{$set: {"cart.$.quantity":quantity, "cart.$.color":color}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? "Updated successfully" : "Something went wrong"
        })
    }else{
        const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? "Updated successfully" : "Something went wrong"
        })
    }
})

const deleteCart = asyncHandle(async(req, res)=>{
    const { _id } = req.user
    const { pid } = req.params
    const user = await User.findById({_id: _id}).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if(!alreadyProduct){
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? "Update" : "Something went wrong"
        })
    }
    const response = await User.findByIdAndUpdate(_id,{$pull: {cart: {product: pid}}},{new: true})
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? "Delete is successfully" : "Something went wrong"
    })
}) 

module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateAddressUser,
    updateCart,
    finalRegister,
    deleteCart
}