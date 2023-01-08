const express = require('express')
const connectDB = require("./config/db")
const dotenv = require('dotenv')

dotenv.config()
const app = express();
connectDB()

const PORT = process.env.PORT
app.listen(PORT,  console.log('server running'))
