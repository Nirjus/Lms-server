import express from "express";
import { logIn, logOut, socialAuth, updateAccessToken } from "../controller/userAuthController";
import { isLogin, validateRole } from "../middleware/userAuth";

const userAuthRouter = express.Router();

userAuthRouter.post("/login", logIn);

userAuthRouter.get("/logout", isLogin,logOut);

userAuthRouter.get("/refreshtoken", updateAccessToken );

userAuthRouter.post("/social-auth", socialAuth);

export default userAuthRouter;