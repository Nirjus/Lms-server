import express from "express";
import { isLogin, validateRole } from "../middleware/userAuth";
import { createLayout, editLayout, getLayout } from "../controller/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isLogin, validateRole("admin"), createLayout);
layoutRouter.put("/edit-layout", isLogin, validateRole("admin"), editLayout);
layoutRouter.get("/get-layout", getLayout);

export default layoutRouter;
