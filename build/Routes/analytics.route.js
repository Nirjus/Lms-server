"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../middleware/userAuth");
const analytics_controller_1 = require("../controller/analytics.controller");
const analyticsRouter = express_1.default.Router();
analyticsRouter.get("/get-user-analytics", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), analytics_controller_1.getUserAnalytics);
analyticsRouter.get("/get-course-analytics", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), analytics_controller_1.getCoursesAnalytics);
analyticsRouter.get("/get-order-analytics", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), analytics_controller_1.getOrderAnalytics);
exports.default = analyticsRouter;
