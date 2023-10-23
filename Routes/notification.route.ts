import express from "express"
import { isLogin, validateRole } from "../middleware/userAuth";
import { getNotification, updateNotification } from "../controller/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get("/get-all-notification", isLogin, validateRole("admin"), getNotification);
notificationRouter.put("/update-notifications/:id", isLogin, validateRole("admin"), updateNotification);

export default notificationRouter;