"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeScret = exports.stripePublishKey = exports.cloudinaryName = exports.cloudinaryApiSecret = exports.cloudinaryApiKey = exports.accessKey = exports.refreshKey = exports.smtpPassword = exports.smtpUserName = exports.jwtResetPassKey = exports.jwtActivationKey = exports.redisUrl = exports.nodeENV = exports.frontendUrl = exports.mongoUri = exports.port = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: "./secret/.env"
});
exports.port = process.env.PORT || 6000;
exports.mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/lms";
exports.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
exports.nodeENV = process.env.NODE_ENV || "";
exports.redisUrl = process.env.REDIS_URL || "";
exports.jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "sgsfgMGH354786453^%$#@#%hgfjsdfs52343MNGFD%$^&";
exports.jwtResetPassKey = process.env.JWT_REST_PASS_KEY || "FHGjghcf534HGfxg$%#%$cfgdh^%#354";
exports.smtpUserName = process.env.SMTP_USERNAME || "";
exports.smtpPassword = process.env.SMTP_PASSWORD || "";
exports.refreshKey = process.env.REFRESH_KEY || "GFDfgdfs354BFD4324#@$";
exports.accessKey = process.env.ACCESS_KEY || "DGShfd5345%#%@$FDfxgd35";
exports.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || "";
exports.cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || "";
exports.cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME || "";
exports.stripePublishKey = process.env.STRIPE_PUBLISHABLE_KEY || "";
exports.stripeScret = process.env.STRIPE_SECRET_KEY || "";
