"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../middleware/userAuth");
const notification_controller_1 = require("../controller/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.get("/get-all-notification", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), notification_controller_1.getNotification);
notificationRouter.put("/update-notifications/:id", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), notification_controller_1.updateNotification);
exports.default = notificationRouter;
