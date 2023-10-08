import express,{Request, Response, NextFunction} from "express";
import ErrorHandler from "../utils/errorHandeler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { accessKey } from "../secret/secret";
import { redis } from "../utils/redis";
import { CustomRequest } from "../@types/custom";
//  authenticated user
export const isLogin = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const token = req.cookies.access_token;

        if(!token){
            return next(new ErrorHandler("Plase log In to access this resources", 400));
        }
      
        const decoded = jwt.verify(token.token,accessKey) as JwtPayload;
      
       
        if(!decoded){
            return next(new ErrorHandler("You are not a authorised user", 400));
        }
        const user = await redis.get(decoded.user._id);
        
        if(!user){
            return next(new ErrorHandler("User not found", 400));
        }
        (req as CustomRequest).user = JSON.parse(user);
        
        next();
    } catch (error:any) {
        return next(new ErrorHandler(error.message,400));
    }
}

// validate user role
export const validateRole = (...roles:string[]) => {
    return (req: CustomRequest, res:Response, next: NextFunction) => {
        if(!roles.includes(req.user?.role || "")){
                return next(new ErrorHandler(`${req.user?.role}s are not allow to access this resources!`,403));
        }
        next();
    }
}