import express from "express";
import { activateUser, allCreaters, deleteUser, forgetPassword, getAllUsers, getUserInfo, registrationUser, resetPassoword, updatePassword, updateUser, updateUserRole } from "../controller/userController";
import { isLogin, validateRole } from "../middleware/userAuth";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activation", activateUser);

userRouter.get("/me", isLogin, getUserInfo);

userRouter.put("/update-user", isLogin,updateUser);
userRouter.put("/update-password", isLogin, updatePassword);

userRouter.post("/forgot-password", forgetPassword);
userRouter.post("/reset-password", resetPassoword);

userRouter.get("/get-all-creaters", allCreaters);

userRouter.get("/get-all-users", isLogin, validateRole("admin"), getAllUsers);
userRouter.put("/update-user-role", isLogin, validateRole("admin"), updateUserRole);

userRouter.delete("/delete-user/:id", isLogin, validateRole("admin"), deleteUser);
export default userRouter;