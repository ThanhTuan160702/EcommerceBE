const jwt = require('jsonwebtoken')

const gennerateAccessToken = (uid, role) => jwt.sign({_id: uid, role}, process.env.JWT_SECRET,{expiresIn: '3d'})
const gennerateRefreshToken = (uid) => jwt.sign({_id: uid}, process.env.JWT_SECRET,{expiresIn: '7d'})

module.exports = {
    gennerateAccessToken,
    gennerateRefreshToken
}