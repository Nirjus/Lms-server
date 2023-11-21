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
exports.updateNotification = exports.getNotification = void 0;
const notificationModel_1 = __importDefault(require("../model/notificationModel"));
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const node_cron_1 = __importDefault(require("node-cron"));
//  get All notification --> Admin
const getNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notificationModel_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notification,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getNotification = getNotification;
// update notification status -- only Admin
const updateNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notificationModel_1.default.findById(req.params.id);
        if (!notification) {
            return next(new errorHandeler_1.default("no nofication found by this Id", 400));
        }
        (notification === null || notification === void 0 ? void 0 : notification.status) ? notification.status = 'read' : notification === null || notification === void 0 ? void 0 : notification.status;
        yield notification.save();
        const notifications = yield notificationModel_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.updateNotification = updateNotification;
//  delete notification -- Admin
node_cron_1.default.schedule("0 0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    yield notificationModel_1.default.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } });
    console.log("Delete read notification");
}));
