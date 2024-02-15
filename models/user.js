const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        defalut: null
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum: [6666, 9999],
        default: '6666',
    },
    cart: [
        {
            product: {type: mongoose.Types.ObjectId, ref: 'Product'},
            quantity: Number,
            color: String
        }
    ],
    address:String,
    wishlist: [{type: mongoose.Types.ObjectId, ref: 'Product'}],
    isBlocked: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    passwordChangeAt:{
        type: String
    },
    passwordResetToken:{
        type: String
    },
    passwordResetExpire:{
        type: String
    },
    registerToken:{
        type: String
    }
},{
    timestamps: true
});

/*userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})*/

userSchema.methods = {
    isCorrectPassword: async function(password){
        return await bcrypt.compare(password, this.password)
    },
    createPasswordChangeToken: function(){
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpire = Date.now() + 15 * 60 * 1000
        return resetToken
    }
}



//Export the model
module.exports = mongoose.model('User', userSchema);