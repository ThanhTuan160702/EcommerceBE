const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    products:[
        {
            product: {type: mongoose.Types.ObjectId, ref: 'Product'},
            quantity: Number,
            color: String     
        }
    ],
    status:{
        type:String,
        default: 'Processing',
        enum: ['Cancelled', 'Processing', 'Successed']
    },
    total: Number,
    address: String,
    mobile: String,
    orderBy:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);