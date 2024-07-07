import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser= asyncHandler(async(req,res,next)=>{
    // get user from frontend
    // validation check (if not empty)
    // check user if already exists
    // check for images
    // check for avtar
    // upload them to cloudinary
    // create user object for mongodb
    // remove password and refresh token field from frontend
    // check for user creation return response


    // step 1 get data
    const {username,email,fullname,password}=req.body;
    console.log(email);
    if(fullname=="" || username=="" || email=="" || password==""){
        throw new ApiError(400,"required field is required")
    }
    const existeduser=User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new ApiError(400,"User already exists")

    }
    // check for images
    const avatarLocalpath=req.files?.avatar[0]?.path;
    const coverImageLocalpath= req.files?.coverImage[0]?.path;
    if(!avatarLocalpath){
        throw new ApiError(400,"Image is required")
    }
    // upload them to cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalpath)
    const coverImage=await uploadOnCloudinary(coverImageLocalpath)
    if(!avatar){
        throw new ApiError(500,"Image upload failed")
    }

    // create user object for mongodb
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url,
        email,
        password,
        username:username.toLowerCase()

    })
    const createduser = await user.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new ApiError(500,"User creation failed")
    }

    // check for user creation return response
    return res.status(200).json(new ApiResponse(200,createduser,"User registered successfully"))
    
})
export default registerUser;