"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../middleware/userAuth");
const layout_controller_1 = require("../controller/layout.controller");
const layoutRouter = express_1.default.Router();
layoutRouter.post("/create-layout", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), layout_controller_1.createLayout);
layoutRouter.put("/edit-layout", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), layout_controller_1.editLayout);
layoutRouter.get("/get-layout/:type", layout_controller_1.getLayout);
exports.default = layoutRouter;
