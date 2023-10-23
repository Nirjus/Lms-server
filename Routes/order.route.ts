import express from "express";
import { isLogin, validateRole } from "../middleware/userAuth";
import { createOrder, getAllOrders } from "../controller/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isLogin, createOrder);
orderRouter.get("/get-all-orders", isLogin, validateRole("admin"),getAllOrders);

export default orderRouter;