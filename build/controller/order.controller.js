"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createOrder = void 0;
const userModel_1 = __importDefault(require("../model/userModel"));
const notificationModel_1 = __importDefault(require("../model/notificationModel"));
const courseModel_1 = __importDefault(require("../model/courseModel"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const orderService_1 = require("../services/orderService");
const sendEmail_1 = require("../helper/sendEmail");
const secret_1 = require("../secret/secret");
const redis_1 = require("../utils/redis");
const stripe = require("stripe")(secret_1.stripeScret);
// create order
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new errorHandeler_1.default("Payment not authorised", 400));
                }
            }
        }
        const user = yield userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        const courseExists = user === null || user === void 0 ? void 0 : user.courses.some((course) => course._id.toString() === courseId);
        if (courseExists) {
            return next(new errorHandeler_1.default("You have already parchesed this course", 400));
        }
        const course = yield courseModel_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandeler_1.default("Course not found", 400));
        }
        const data = {
            courseId: course._id,
            userId: user === null || user === void 0 ? void 0 : user._id,
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
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirm.ejs"), { order: mailData.order });
        try {
            if (user) {
                yield (0, sendEmail_1.sendMail)({
                    email: user.email,
                    subject: "Order Confirmation mail",
                    html: html,
                });
            }
        }
        catch (error) {
            return next(new errorHandeler_1.default(error.message, 500));
        }
        user === null || user === void 0 ? void 0 : user.courses.push(course === null || course === void 0 ? void 0 : course._id);
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(user));
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield notificationModel_1.default.create({
            userId: user === null || user === void 0 ? void 0 : user._id,
            title: "New Order",
            message: `You have a new order from ${course === null || course === void 0 ? void 0 : course.name}`,
        });
        course.purchased = course.purchased + 1;
        yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        yield course.save();
        yield (0, orderService_1.newOrder)(data, res, next);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.createOrder = createOrder;
// get all orders --> Admin
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, orderService_1.allOrders)(res);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getAllOrders = getAllOrders;
