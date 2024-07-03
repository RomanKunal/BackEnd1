import CookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

const app =express();
    app.use(cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }))
app.use(express.json({limit:'32kb'}))
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(CookieParser())


export { app } 