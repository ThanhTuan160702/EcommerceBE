const mongoose = require('mongoose'); // Erase if already required
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true //Bỏ dấu cách
    },
    //Link sản phẩm ví dụ máy tính - may-tinh
    slug:{
        type:String,
        required:true,
        unique: true,
        lowercase: true
    },
    description:{
        type:Array,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        default: 0
    },
    sold:{
        type:Number,
        default: 0
    },
    images:{
        type:Array
    },
    color:{
        type:String
    },
    Gb:{
        type:String
    },
    variant:{
        type:Boolean,
        default: false
    },
    ratings:[
        {
            star: {type: Number},
            firstname: {type: String,ref: 'User'},
            lastname: {type: String, ref: 'User'},
            postedBy: {type: mongoose.Types.ObjectId, ref: 'User'},
            comment: {type: String}
        }
    ],
    totalRatings:{
        type:Number,
        default: 0
    }
},{
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);