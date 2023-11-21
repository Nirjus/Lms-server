"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthController_1 = require("../controller/userAuthController");
const userAuth_1 = require("../middleware/userAuth");
const userAuthRouter = express_1.default.Router();
userAuthRouter.post("/login", userAuthController_1.logIn);
userAuthRouter.get("/logout", userAuth_1.isLogin, userAuthController_1.logOut);
// userAuthRouter.get("/refreshtoken", updateAccessToken );
userAuthRouter.post("/social-auth", userAuthController_1.socialAuth);
exports.default = userAuthRouter;
