import { NextFunction,Response } from "express";
import Order from "../model/orderModel";

// create new Order 
export const newOrder = async (data: any, res:Response, next:NextFunction) => {
    const order = await Order.create(data);
     res.status(201).json({
        success: true,
        order
     })
}
// get all orders --> admin
export const allOrders = async (res: Response) => {
   const orders = await Order.find().sort({createdAt: -1});

   res.status(201).json({
      success: true,
      orders,
   })
}