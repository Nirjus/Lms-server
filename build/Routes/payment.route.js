"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../middleware/userAuth");
const payment_controller_1 = require("../controller/payment.controller");
const paymentRoute = express_1.default.Router();
paymentRoute.get("/stripepublishablekey", payment_controller_1.sendStripepublishableKey);
paymentRoute.post("/newPayment", userAuth_1.isLogin, payment_controller_1.newPayment);
exports.default = paymentRoute;
