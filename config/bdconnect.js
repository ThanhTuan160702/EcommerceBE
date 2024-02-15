const { default: mongoose } = require('mongoose')

const dbConnect = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if(conn.connection.readyState === 1){
            console.log('Success')
        }else{
            console.log('fail')
        }
        
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

module.exports = dbConnect