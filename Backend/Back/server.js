import express from 'express'
//require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

app.get('/',(req,res)=>{
    res.send('<h1>This is my server</h1>')
})

app.get('/jokes',(req,res)=>{
    const jokes = [
        {
            id:1,
            joke:"Why did the scarecrow win an award? Because he was outstanding in his field."
        },
        {
            id:2,
            joke:"Why did the math book look sad? Because it had too many problems."
        },
        {
            id:3,
            joke:"Why did the tomato turn red? Because it saw the salad dressing!"
        }
    ]
    res.send(jokes)
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
