import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, updatepassword, getcurrentuser,updateavatar,
updatecoverimage,getuserchannelprofile,updateAccountDetails,getWatchHistory } from "../controllers/User.controller.js";

import { upload } from "../middlewares/multer.midlleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const routes = Router();

routes.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        {name:'coverImage',maxCount:1}
    ]), 
    registerUser);
routes.route("/login").post(loginUser);

// secured routes
routes.route("/logout").post( verifyJWT,logoutUser)
routes.route("/refresh-token").post(refreshAccessToken)
routes.route("/change-password").post(verifyJWT,updatepassword)
routes.route("current-user").get(verifyJWT,getcurrentuser)
routes.route("/update-avatar").patch(verifyJWT,upload.single('avatar'),updateavatar)
routes.route("/update-cover-image").patch(verifyJWT,upload.single('coverImage'),updatecoverimage)
routes.route("/channel-profile").get(getuserchannelprofile)
routes.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
routes.route("/watch-history").get(verifyJWT,getWatchHistory)


export default routes;