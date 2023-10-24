import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import { generateLast12monthData } from "../utils/analytics.generater";
import User from "../model/userModel";
import Course from "../model/courseModel";
import Order from "../model/orderModel";

// user analytics --Admin
export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const userAnalytic = await generateLast12monthData(User);

        res.status(200).json({
            success: true,
            userAnalytic,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}

//   course analytics --Admin
export const getCoursesAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const courseAnalytic = await generateLast12monthData(Course);

        res.status(200).json({
            success: true,
            courseAnalytic,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}
//  order analytics --Admin
export const getOrderAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const orderAnalytic = await generateLast12monthData(Order);

        res.status(200).json({
            success: true,
            orderAnalytic,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}