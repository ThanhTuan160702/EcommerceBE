const express = require('express')
require('dotenv').config()
const dbConnect = require('../config/bdconnect')
const initRoutes = require('../routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')



const app = express()
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(cookieParser())
const port = process.env.PORT || 8888
app.use(express.json()) // thằng express có thể đọc hiểu được cái data mà th client gửi lên
app.use(express.urlencoded({extended: true}))
dbConnect()

app.get('/',(req, res) => {
    res.send("Server On")
})

initRoutes(app)

app.listen(port, () => {
    console.log('Server running:'+port)
})
