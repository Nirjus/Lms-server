"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRole = exports.isLogin = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const userAuthController_1 = require("../controller/userAuthController");
//  authenticated user
const isLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            try {
                yield (0, userAuthController_1.updateAccessToken)(req, res, next);
            }
            catch (error) {
                next(error);
            }
        }
        else {
            const decoded = jsonwebtoken_1.default.decode(token.token);
            if (!decoded) {
                return next(new errorHandeler_1.default("You are not a authorised user", 400));
            }
            const user = yield redis_1.redis.get(decoded.user._id);
            if (!user) {
                return next(new errorHandeler_1.default("User not found", 400));
            }
            req.user = JSON.parse(user);
            next();
        }
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.isLogin = isLogin;
// validate user role
const validateRole = (...roles) => {
    return (req, res, next) => {
        var _a, _b;
        if (!roles.includes(((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || "")) {
            return next(new errorHandeler_1.default(`${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role}s are not allow to access this resources!`, 403));
        }
        next();
    };
};
exports.validateRole = validateRole;
