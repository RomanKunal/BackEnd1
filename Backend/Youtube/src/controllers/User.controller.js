import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



// get user from frontend 
// validation check (if not empty) 
// check user if already exists 
// check for images 
// check for avtar 
// upload them to cloudinary 
// create user object for mongodb 
// remove password and refresh token field from frontend 
// check for user creation return response


//Generate refresh and access token together

const GenerateAccessTokenandRefreshToken=async(userId)=>{
    try {
        const user=User.findById(userId)
        const Access=user.generateAccessToken()
        const Refresh=user.generateRefreshToken()

        user.refreshToken=Refresh
        await user.save({validateBeforeSave:false})
        return {Access,Refresh}

    } catch (error) {
        throw new ApiError(500,"Token generation failed");
    }
}

//Register User

const registerUser = asyncHandler(async (req, res, next) => {
  // Step 1: Get data from request body
  const { username, email, fullname, password } = req.body;
  console.log("Received data: ", { email, username, fullname, password });

  // Step 2: Validation check
  if (!fullname || !username || !email || !password) {
    return next(new ApiError(400, "Required field is missing"));
  }

  // Step 3: Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return next(new ApiError(400, "User already exists"));
  }
  console.log(req.files);

  // Step 4: Check for images
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  console.log("Avatar path: ", avatarLocalPath);
  console.log("Cover image path: ", coverImageLocalPath);

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar image is required"));
  }

  // Step 5: Upload images to Cloudinary
  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;
    console.log("Uploaded avatar: ", avatar);
    console.log("Uploaded cover image: ", coverImage);
  } catch (error) {
    return next(new ApiError(500, "Image upload failed"));
  }

  if (!avatar) {
    return next(new ApiError(500, "Avatar upload failed"));
  }

  // Step 6: Create user object for MongoDB
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url,
    email,
    password,
    username: username.toLowerCase(),
  });

  // Step 7: Remove sensitive fields from the response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    return next(new ApiError(500, "User creation failed"));
  }

  // Step 8: Return response
  return res.status(200).json(new ApiResponse(200, createdUser, "User registered successfully"));
});


//LOGIN USER
//step1 get data from request body
//step2 find user in db
//step3 check if user exists
//step4 check password
//step5 create token
//step6 return response

const LoginUser=asyncHandler(async(req,res,next)=>{

    //step1 get data from request body
    const {email,password}=req.body;
    console.log("Received data: ", { email, password });

    //check for validation
    if(!email || !password){
        throw new ApiError(400,"Required field is missing");
    }

    //step2 find user in db

    const user=await User.findOne(
        {
            $or:[{email},{username:email}]
        }
    );

    //step3 check if user exists
    if(!user){
        throw new ApiError(400,"User not found");
    }

    //step4 check password
    const isPasswordvalid=await user.isPasswordcorrect(password);

    if(!isPasswordvalid){
        throw new ApiError(400,"Password is incorrect");
    }

    //step5 create token
    const {Access,Refresh}=await GenerateAccessTokenandRefreshToken(user._id); 


    //step6 return response
    const LoggedInUser=await User.findById(user._id).select("-password -refreshToken");

    //send cookies
    const Options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("access",Access,Options).cookie("refresh",Refresh,Options).json(new ApiResponse(200,LoggedInUser,"User logged in successfully"));
})

//logout user  

const LogOutUser=asyncHandler(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    })
     
    const Options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("access",Options).clearCookie("refresh",Options).json(new ApiResponse(200,{},"User logged out successfully"));
})


export {
    registerUser,
    LoginUser,
    LogOutUser
};