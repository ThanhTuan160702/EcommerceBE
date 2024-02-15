const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')

// Declare the Schema of the Mongo model
var finalregisterSchema = new mongoose.Schema({
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    token:{
        type:String
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expireAfterSeconds: 900
    }
});

finalregisterSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password, salt)
})

//Export the model
module.exports = mongoose.model('FinalRegister', finalregisterSchema);