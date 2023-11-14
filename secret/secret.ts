import dotenv from "dotenv";

dotenv.config({
    path:"./secret/.env"
});

export const port = process.env.PORT || 6000;

export const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/lms";

export const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

export const nodeENV = process.env.NODE_ENV || "";

export const redisUrl = process.env.REDIS_URL || "";

export const jwtActivationKey = process.env.JWT_ACTIVATION_KEY || "sgsfgMGH354786453^%$#@#%hgfjsdfs52343MNGFD%$^&";

export const jwtResetPassKey = process.env.JWT_REST_PASS_KEY || "FHGjghcf534HGfxg$%#%$cfgdh^%#354";

export const smtpUserName = process.env.SMTP_USERNAME || "";

export const smtpPassword = process.env.SMTP_PASSWORD || "";

export const refreshKey = process.env.REFRESH_KEY || "GFDfgdfs354BFD4324#@$";

export const accessKey = process.env.ACCESS_KEY || "DGShfd5345%#%@$FDfxgd35";

export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY || "";

export const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET || "";

export const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME || "";

export const videoCyperAPISecret = process.env.VIDEOCIPER_API_SECRET || "";