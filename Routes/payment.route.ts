import express from "express";
import { isLogin } from "../middleware/userAuth";
import { newPayment, sendStripepublishableKey } from "../controller/payment.controller";

const paymentRoute = express.Router();

paymentRoute.get("/stripepublishablekey",  sendStripepublishableKey);
paymentRoute.post("/newPayment", isLogin, newPayment);

export default paymentRoute;