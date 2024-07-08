import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";




export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.access || req.headers.authorization?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized");    
        }
    
        // verify jwt
        const decodedinfo=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedinfo?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid AccessToken");
        }
    
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,"Unauthorized");
    }

})