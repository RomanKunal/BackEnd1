import { Router } from "express";
import { registerUser, LoginUser, LogOutUser } from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.midlleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const routes = Router();

routes.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        {name:'coverImage',maxCount:1}
    ]), 
    registerUser);
routes.route("/login").post(LoginUser);

// secured routes
routes.route("/logout").post( verifyJWT,LogOutUser)

export default routes;