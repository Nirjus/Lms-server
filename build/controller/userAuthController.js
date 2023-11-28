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
exports.socialAuth = exports.updateAccessToken = exports.logOut = exports.logIn = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const userModel_1 = __importDefault(require("../model/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jsonwebtoken_2 = __importDefault(require("../helper/jsonwebtoken"));
const secret_1 = require("../secret/secret");
const redis_1 = require("../utils/redis");
exports.accessTokenOptions = {
    expires: new Date(Date.now() + 5 * 60 * 1000),
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
};
const logIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandeler_1.default("Please enter email and password", 400));
        }
        const user = yield userModel_1.default.findOne({ email: email }).select("+password");
        if (!user) {
            return next(new errorHandeler_1.default("Invalid email or password", 400));
        }
        const comparePassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!comparePassword) {
            return next(new errorHandeler_1.default("Password did not matched", 400));
        }
        //  upload session to redis
        redis_1.redis.set(user._id, JSON.stringify(user));
        const accessToken = (0, jsonwebtoken_2.default)("5m", user, secret_1.accessKey);
        const refreshToken = (0, jsonwebtoken_2.default)("7d", user, secret_1.refreshKey);
        res.cookie("access_token", accessToken, exports.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
        res.status(200).json({
            success: true,
            message: "User Log In successfully.",
            user,
            accessToken,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.logIn = logIn;
const logOut = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "";
        redis_1.redis.del(userId);
        res.status(200).json({
            success: true,
            message: "Logged Out successfully.",
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.logOut = logOut;
// update access token
const updateAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token.token, secret_1.refreshKey);
        if (!decoded) {
            return next(new errorHandeler_1.default("refresh token not found", 400));
        }
        const session = yield redis_1.redis.get(decoded.user._id);
        if (!session) {
            return next(new errorHandeler_1.default("Please login to access this resource", 400));
        }
        const user = JSON.parse(session);
        const accessToken = (0, jsonwebtoken_2.default)("10m", user, secret_1.accessKey);
        const refreshToken = (0, jsonwebtoken_2.default)("7d", user, secret_1.refreshKey);
        req.user = user;
        res.cookie("access_token", accessToken, exports.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
        yield redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7 day
        return next();
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.updateAccessToken = updateAccessToken;
//  social authentication
const socialAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, avatar } = req.body;
        const user = yield userModel_1.default.findOne({ email: email });
        if (!user) {
            const newUser = yield userModel_1.default.create({
                email: email,
                name: name,
                socialAvatar: avatar,
            });
            //  upload session to redis
            redis_1.redis.set(newUser._id, JSON.stringify(newUser));
            const accessToken = (0, jsonwebtoken_2.default)("5m", newUser, secret_1.accessKey);
            const refreshToken = (0, jsonwebtoken_2.default)("7d", newUser, secret_1.refreshKey);
            res.cookie("access_token", accessToken, exports.accessTokenOptions);
            res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
            return res.status(201).json({
                success: true,
                message: "User LoggedIn successfully.",
                user: newUser,
                accessToken,
            });
        }
        else {
            //  upload session to redis
            redis_1.redis.set(user._id, JSON.stringify(user));
            const accessToken = (0, jsonwebtoken_2.default)("5m", user, secret_1.accessKey);
            const refreshToken = (0, jsonwebtoken_2.default)("7d", user, secret_1.refreshKey);
            res.cookie("access_token", accessToken, exports.accessTokenOptions);
            res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
            return res.status(201).json({
                success: true,
                message: "User LoggedIn successfully.",
                user,
                accessToken,
            });
        }
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.socialAuth = socialAuth;
