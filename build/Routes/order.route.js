"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../middleware/userAuth");
const order_controller_1 = require("../controller/order.controller");
const orderRouter = express_1.default.Router();
orderRouter.post("/create-order", userAuth_1.isLogin, order_controller_1.createOrder);
orderRouter.get("/get-all-orders", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), order_controller_1.getAllOrders);
exports.default = orderRouter;
