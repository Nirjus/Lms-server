import express from "express";
import { activateUser, getUserInfo, registrationUser, updatePassword, updateUser } from "../controller/userController";
import { isLogin } from "../middleware/userAuth";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activation", activateUser);

userRouter.get("/me", isLogin, getUserInfo);

userRouter.put("/update-user", isLogin,updateUser);
userRouter.put("/update-password", isLogin, updatePassword);
export default userRouter;