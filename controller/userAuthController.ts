import express, { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import User, { IUser } from "../model/userModel";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import createJWT_token from "../helper/jsonwebtoken";
import { accessKey, nodeENV, refreshKey } from "../secret/secret";
import { redis } from "../utils/redis";
import { CustomRequest } from "../@types/custom";
interface ILoginRequest {
    email: string;
    password: string;
}
interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
}

export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + 5 * 60 * 1000),  // 5 min
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
};

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + 7*24*60*60*1000),   // 1 hr.
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    sameSite: "lax",
};

// only true for production mode
if (nodeENV === "production") {
    accessTokenOptions.secure = true;
}

export const logIn = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }

        const user = await User.findOne({ email: email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            return next(new ErrorHandler("Password did not matched", 400));
        }

        //  upload session to redis
        redis.set(user._id, JSON.stringify(user) as any);


        const accessToken = createJWT_token("5m", user, accessKey);
        const refreshToken = createJWT_token("7d", user, refreshKey);


        // only true for production mode
        if (nodeENV === "production") {
            accessTokenOptions.secure = true;
        }

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            success: true,
            message: "User Log In successfully.",
            user,
            accessToken,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
};


export const logOut = async (req: CustomRequest, res: Response, next: NextFunction) => {

    try {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
  
         const userId = req.user?._id || "";
       
        redis.del(userId);

        res.status(200).json({
            success: true,
            message: "Logged Out successfully.",
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
}

// update access token
export const updateAccessToken = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token;

        const decoded = jwt.verify(refresh_token.token,refreshKey) as JwtPayload;

        if(!decoded){
            return next(new ErrorHandler("refresh token not found",400));
        }
        const session = await redis.get(decoded.user._id);
        if(!session){
            return next(new ErrorHandler("User not found", 400));
        }
        const user = JSON.parse(session);

        const accessToken = createJWT_token("10m",user, accessKey);

        const refreshToken = createJWT_token("7d", user, refreshKey);
      
        (req as CustomRequest).user = user;

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

       res.status(200).json({
        success: true,
        message: "accesstoken created successfully",
        accessToken,
       })

    } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
    }
}
interface ISocialAuthBody{
    email: string,
    name: string,
    avatar: string,
}
//  social authentication
export const socialAuth = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const {name, email, avatar} = req.body as ISocialAuthBody
        const user = await User.findOne({email: email});

        if(!user){
            const newUser = await User.create({
                email:email,
                name:name,
                avatar:avatar,
            })
            //  upload session to redis
        redis.set(newUser._id, JSON.stringify(newUser) as any);

        const accessToken = createJWT_token("5m", newUser, accessKey);
        const refreshToken = createJWT_token("7d", newUser, refreshKey);
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        return res.status(201).json({
            success: true,
            message: "User created successfully.",
            newUser,
            accessToken,
        })
        }else{
                //  upload session to redis
        redis.set(user._id, JSON.stringify(user) as any);

        const accessToken = createJWT_token("5m", user, accessKey);
        const refreshToken = createJWT_token("7d", user, refreshKey);
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

       return res.status(201).json({
            success: true,
            message: "User created successfully.",
            user,
            accessToken,
        })
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message,400));
        
    }
}