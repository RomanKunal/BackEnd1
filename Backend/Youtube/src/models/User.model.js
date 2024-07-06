import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//User Schema

const UserSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avtar:{
        type:String, //cloudinarry url aayega 
        required:true
    },
    coverImage:{
        type:String

    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    }],
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    } 

},{timestamps:true})

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password=await bcrypt.hash(this.password,10)
    next()
})


//Password check after encryption
//We will use this method to check the password


UserSchema.methods.isPasswordcorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

//Generate Access Token

UserSchema.methods.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )

}
//Generate Refresh Token

UserSchema.methods.generateRefreshToken=function(){

    jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY   
    }
    )
}


//User Model export


export const User=mongoose.model('User',UserSchema)


