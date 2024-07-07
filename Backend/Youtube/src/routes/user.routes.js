import { Router } from "express";
import registerUser from "../controllers/User.controller.js";
import { upload } from "../middlewares/multer.midlleware.js";
const routes = Router();

routes.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        {name:'coverImage',maxCount:1}
    ]), 
    registerUser);



export default routes;