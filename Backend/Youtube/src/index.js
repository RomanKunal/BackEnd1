import mongoose from 'mongoose'
import express from 'express'

//require('dotenv').config({path:'./.env'})
import dotenv from 'dotenv'
import connectDB from './db/inndex.js'

dotenv.config({path:'./.env'})

// 1st Way to connect DB
connectDB()




/* 2nd Way to connect DB
const app = express()
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on('error',(error)=>{
            console.log(error);     
        })
        app.listen(process.dotenv.PORT,()=>{
            console.log(`Server is running on port ${process.dotenv.PORT}`)
        
        })
    } catch (error) {
        console.log(error)
    }
})()
*/