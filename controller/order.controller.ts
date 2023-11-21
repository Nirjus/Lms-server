import express, { Response, Request, NextFunction } from "express";

import Order, { IOrder } from "../model/orderModel";
import User from "../model/userModel";
import Notification from "../model/notificationModel";
import Course, { Icourse } from "../model/courseModel";
import path from "path";
import ejs from "ejs";
import ErrorHandler from "../utils/errorHandeler";
import { CustomRequest } from "../@types/custom";
import { allOrders, newOrder } from "../services/orderService";
import { sendMail } from "../helper/sendEmail";
import { stripeScret } from "../secret/secret";
import { redis } from "../utils/redis";
const stripe = require("stripe")(stripeScret);

// create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, payment_info } = req.body as IOrder;

    if(payment_info){
      if("id" in payment_info){
        const paymentIntentId = payment_info.id;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        if(paymentIntent.status !== "succeeded"){
          return next(new ErrorHandler("Payment not authorised", 400));
        }
      }
    }

    const user = await User.findById((req as CustomRequest).user?._id);

    const courseExists = user?.courses.some(
      (course: any) => course._id.toString() === courseId
    );

    if (courseExists) {
      return next(
        new ErrorHandler("You have already parchesed this course", 400)
      );
    }
    const course:Icourse | null = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorHandler("Course not found", 400));
    }
    
    const data: any = {
      courseId: course._id,
      userId: user?._id,
      payment_info,
    };

    const mailData = {
      order: {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };

    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/order-confirm.ejs"),
      { order: mailData.order }
    );

    try {
      if (user) {
        await sendMail({
          email: user.email,
          subject: "Order Confirmation mail",
          html: html,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
    
    user?.courses.push(course?._id);
    await redis.set(user?._id, JSON.stringify(user));
    await user?.save();
    await Notification.create({
      userId: user?._id,
      title: "New Order",
      message: `You have a new order from ${course?.name}`,
    });
    course.purchased = course.purchased + 1;
    await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
    await course.save();
   await newOrder(data, res, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// get all orders --> Admin
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {

    try {
        allOrders(res);
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500))
    }
}