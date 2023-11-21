"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createJWT_token = (expiresIn, user, secretKey) => {
    if (typeof user !== "object" || !user) {
        throw new Error("Payload must be a non-empty object");
    }
    if (typeof secretKey !== "string" || secretKey === "") {
        throw new Error("secret key must be a non-empty string");
    }
    try {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const token = jsonwebtoken_1.default.sign({ user, activationCode }, secretKey, { expiresIn });
        return {
            token,
            activationCode
        };
    }
    catch (error) {
        console.error("Faild to load JWT :", error);
        throw error;
    }
};
exports.default = createJWT_token;
