import Notification from "../model/notificationModel";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import cron from "node-cron";
//  get All notification --> Admin
export const getNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await Notification.find().sort({createdAt: -1});

        res.status(200).json({
            success: true,
            notification,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}

// update notification status -- only Admin
export const updateNotification = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const notification = await Notification.findById(req.params.id);
        if(!notification){
            return next(new ErrorHandler("no nofication found by this Id",400));
        }
        notification?.status ? notification.status = 'read' : notification?.status;

        await notification.save();
        const notifications = await Notification.find().sort({
            createdAt: -1,
        })

        res.status(201).json({
            success: true,
            notifications,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}

//  delete notification -- Admin
cron.schedule("0 0 0 * * *", async() => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  await Notification.deleteMany({status:"read", createdAt:{$lt: thirtyDaysAgo}});
  console.log("Delete read notification");
})