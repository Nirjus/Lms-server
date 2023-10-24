import express from "express";
import { isLogin, validateRole } from "../middleware/userAuth";
import { getCoursesAnalytics, getOrderAnalytics, getUserAnalytics } from "../controller/analytics.controller";
const analyticsRouter = express.Router();

analyticsRouter.get("/get-user-analytics", isLogin, validateRole("admin"), getUserAnalytics);

analyticsRouter.get("/get-course-analytics", isLogin, validateRole("admin"), getCoursesAnalytics);

analyticsRouter.get("/get-order-analytics", isLogin, validateRole("admin"), getOrderAnalytics);


export default analyticsRouter;