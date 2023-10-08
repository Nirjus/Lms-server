import { Express,Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../model/userModel";
import ejs from 'ejs';
import ErrorHandler from "../utils/errorHandeler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import createJWT_token from "../helper/jsonwebtoken";
import { jwtActivationKey } from "../secret/secret";
import { sendMail } from "../helper/sendEmail";
import path from "path";
import { CustomRequest } from "../@types/custom";
import { getUserById } from "../services/userService";
import { redis } from "../utils/redis";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
//  register user

interface IRegistrationBody{
    name:string,
    email:string,
    password:string,
    avatar?: string,
}

export const registrationUser = catchAsyncError(async (req: Request, res: Response,next: NextFunction) => {
    try {
        const {name, email, password} = req.body;

        const isEmailExists = await User.exists({email: email});

        if(isEmailExists){
            return next(new ErrorHandler("Email already exists",400));
        }

        const user:IRegistrationBody = {
            name,
            email,
            password,
        };

        const activationToken = createJWT_token("10m",
        user,
        jwtActivationKey
        );
        const activationCode = activationToken.activationCode;
        const data = {user:{name:user.name},activationCode};
    const html:string = await ejs.renderFile(path.join(__dirname,"../mails/activation-mail.ejs"),data);
       const emailData = {
        email: user.email,
        subject: "Account Activation mail",
        html: html,
       };

       await sendMail(emailData);

      res.status(201).json({
        success: true,
        message: `please go to your ${user.email} to activate your account.`,
        activationToken: activationToken.token,
      })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//   activate user
interface IActivationRequest{
    activation_token: string,
    activation_code: string,
}

export const activateUser = async (req:Request, res:Response, next:NextFunction) => {

    try {
        const {activation_token, activation_code} = req.body as IActivationRequest;

       const newUser: {user: IUser; activationCode: string} = jwt.verify(
        activation_token,
        jwtActivationKey
       )as {user:IUser; activationCode:string}
    

       if(newUser.activationCode !== activation_code){
          return next(new ErrorHandler("Invalid activation code",400));
       }
    
       const {name, email, password} = newUser.user;

       const userExist = await User.exists({email: email});
       if(userExist){
        return next(new ErrorHandler("User already exists please sign In", 400));
       }
       const user = await User.create({
        name:name,
        email:email,
        password:password,
       })
    
       res.status(201).json({
        success: true,
        message:"User created successfully",
        user
       })
    
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
}

//  get user
export const getUserInfo = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        const userId = req.user?._id;
        getUserById(userId,res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
        
    }
}
//  update user information
interface IupdateUserInfo{
    name?:string;
    avatar?:string;
}
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const { name, avatar} = req.body as IupdateUserInfo;

        const userId = (req as CustomRequest).user?._id;
        const user = await User.findById(userId);

        if(name && user){
            user.name = name;
        }
        if(avatar && user){
           if(user.avatar?.public_id){   //  if have old image then delete old then update
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            const myClode = await cloudinary.v2.uploader.upload(avatar,{
                folder: "lmsCloude"
            });
            user.avatar ={
                public_id: myClode.public_id,
                url: myClode.secure_url,
            }
           }else{  //  here we dont have image because of social auth
           const myClode = await cloudinary.v2.uploader.upload(avatar,{
                folder: "lmsCloude"
            });
            user.avatar ={
                public_id: myClode.public_id,
                url: myClode.secure_url,
            }
           }
        }
        await user?.save();

        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            user,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
        
    }
}
// update password controller
interface IUpdatePassword{
    oldPassword: string;
    newPassword: string;
}

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const {oldPassword, newPassword} = req.body as IUpdatePassword;
    
        if(!oldPassword || !newPassword){
            return next(new ErrorHandler("Enter old password and new Password",400));
        }
        const userId = (req as CustomRequest).user?._id;

        const user = await User.findById(userId).select("+password");
        if(user?.password === undefined){
            return next(new ErrorHandler("Invalid user",400));
        }
       
        const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordMatched){
            return next(new ErrorHandler("old password is wrong", 400));
        }
        user.password = newPassword;
        await user.save();
        await redis.set(user._id, JSON.stringify(user));

        res.status(200).json({
            success: true,
            message: "user updated successfully.",
            user,
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
    }
}
// update profile