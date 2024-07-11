import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User} from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullname, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


// LOGIN TIME

// req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const loginUser = asyncHandler(async (req, res) => {
      const { email, username, password } = req.body;
      console.log("Request body:", req.body);
  
      if (!(username || email)) {
          throw new ApiError(400, "username or email is required");
      }
  
      const user = await User.findOne({
          $or: [{ username }, { email }]
      });
  
      if (!user) {
          throw new ApiError(404, "User does not exist");
      }
  
      const isPasswordValid = await user.isPasswordcorrect(password);
      if (!isPasswordValid) {
          throw new ApiError(401, "Invalid user credentials");
      }
  
      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  
      const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
      const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Ensure secure only in production
      };
  
      return res
          .status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options)
          .json(
              new ApiResponse(
                  200,
                  {
                      user: loggedInUser,
                      accessToken,
                      refreshToken
                  },
                  "User logged In Successfully"
              )
          );
  });


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


// REFRESH TOKEN SO THAT USER DOES NOT HAVE TO LOGIN AGAIN AND AGAIN


 const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if(!incomingrefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user= await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }
    if(incomingrefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Invalid and expired refresh token")
    }
  
    const options ={
      httpOnly:true,
      secure:true
    }
  
    await generateAccessAndRefereshTokens(user._id)
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{},"Access token refreshed successfully"))
  } catch (error) {
    throw new ApiError(401,error.message || "Invalid refresh token")
  }

 })


// CURRENT PASSWORD CHANGE
const updatepassword=asyncHandler(async(req,res)=>{
    const {currentPassword,newPassword}=req.body
    const user= await User.findById(req.user?.id)
    const isPasswordValid= await user.isPasswordcorrect(req.body.currentPassword)

    if(!isPasswordValid){
      throw new ApiError(401,"Invalid current password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password updated successfully"))

})


// GET CURRENT USER

const getcurrentuser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"User details fetched successfully"))
})

// UPDATE ACCOUNT DETAILS

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email){
      throw new ApiError(400,"Fullname and email are required")
    }

    const user=User.findByIdAndUpdate(req.user._id,{$set:{fullname,email:email}},{new:true}).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"User details updated successfully"))

})

//UPDATE PROFILE PICTURE

const updateavatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
      throw new ApiError(400,"Avatar file is required")
    }
    const user = User.findByIdAndUpdate(req.user._id,{$set:{avatar:avatar.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
})

// UPDATE COVERIMAGE
const updatecoverimage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
      throw new ApiError(400,"Cover image file is required")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage){
      throw new ApiError(400,"Cover image file is required")
    }
    const user = User.findByIdAndUpdate(req.user._id,{$set:{coverImage:coverImage.url}},{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Cover image updated successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatepassword,
    getcurrentuser,
    updateavatar,
    updatecoverimage

};