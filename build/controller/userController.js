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
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.resetPassoword = exports.forgetPassword = exports.updatePassword = exports.updateUser = exports.getUserInfo = exports.activateUser = exports.registrationUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../model/userModel"));
const ejs_1 = __importDefault(require("ejs"));
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const jsonwebtoken_2 = __importDefault(require("../helper/jsonwebtoken"));
const secret_1 = require("../secret/secret");
const sendEmail_1 = require("../helper/sendEmail");
const path_1 = __importDefault(require("path"));
const userService_1 = require("../services/userService");
const redis_1 = require("../utils/redis");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.registrationUser = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const isEmailExists = yield userModel_1.default.exists({ email: email });
        if (isEmailExists) {
            return next(new errorHandeler_1.default("Email already exists", 400));
        }
        const user = {
            name,
            email,
            password,
        };
        const activationToken = (0, jsonwebtoken_2.default)("10m", user, secret_1.jwtActivationKey);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activation-mail.ejs"), data);
        const emailData = {
            email: user.email,
            subject: "Account Activation mail",
            html: html,
        };
        yield (0, sendEmail_1.sendMail)(emailData);
        res.status(201).json({
            success: true,
            message: `please go to your ${user.email} to activate your account.`,
            activationToken: activationToken.token,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
}));
const activateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, secret_1.jwtActivationKey);
        if (newUser.activationCode !== activation_code) {
            return next(new errorHandeler_1.default("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        const userExist = yield userModel_1.default.exists({ email: email });
        if (userExist) {
            return next(new errorHandeler_1.default("User already exists please sign In", 400));
        }
        const user = yield userModel_1.default.create({
            name: name,
            email: email,
            password: password,
        });
        res.status(201).json({
            success: true,
            message: "User activated successfully",
            user
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.activateUser = activateUser;
//  get user
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        (0, userService_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.getUserInfo = getUserInfo;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const { name, avatar } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const user = yield userModel_1.default.findById(userId);
        if (name && user) {
            user.name = name;
        }
        if (avatar && user) {
            if ((_c = user.avatar) === null || _c === void 0 ? void 0 : _c.public_id) { //  if have old image then delete old then update
                yield cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
                const myClode = yield cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "lmsCloude"
                });
                user.avatar = {
                    public_id: myClode.public_id,
                    url: myClode.secure_url,
                };
            }
            else { //  here we dont have image because of social auth
                const myClode = yield cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "lmsCloude"
                });
                user.avatar = {
                    public_id: myClode.public_id,
                    url: myClode.secure_url,
                };
            }
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.updateUser = updateUser;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new errorHandeler_1.default("Enter old password and new Password", 400));
        }
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
        const user = yield userModel_1.default.findById(userId).select("+password");
        if ((user === null || user === void 0 ? void 0 : user.password) === undefined) {
            return next(new errorHandeler_1.default("Invalid user", 400));
        }
        const isPasswordMatched = yield bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isPasswordMatched) {
            return next(new errorHandeler_1.default("old password is wrong", 400));
        }
        user.password = newPassword;
        yield user.save();
        yield redis_1.redis.set(user._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "user updated successfully.",
            user,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.updatePassword = updatePassword;
const forgetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userModel_1.default.findOne({ email: email }).select("+password");
        if (!user) {
            return next(new errorHandeler_1.default("user not exists with this email", 500));
        }
        if (user.password === undefined) {
            return next(new errorHandeler_1.default("Invalid email", 500));
        }
        const forgetToken = (0, jsonwebtoken_2.default)("2m", user, secret_1.jwtResetPassKey);
        const token = forgetToken.token;
        const data = { frontendUrl: secret_1.frontendUrl, token };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/reset-password.ejs"), data);
        const emailData = {
            email: user.email,
            subject: "Forgot Password mail",
            html: html,
        };
        yield (0, sendEmail_1.sendMail)(emailData);
        res.status(200).json({
            success: true,
            message: `please go to your Email: ${user.email} to reset your password`,
            token,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.forgetPassword = forgetPassword;
const resetPassoword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        const decoded = jsonwebtoken_1.default.verify(token, secret_1.jwtResetPassKey);
        if (!decoded) {
            return next(new errorHandeler_1.default("Invalid token", 500));
        }
        const updates = yield userModel_1.default.findOneAndUpdate({ email: decoded.user.email }, { password: newPassword }, { new: true });
        if (!updates) {
            return next(new errorHandeler_1.default("password not updated", 500));
        }
        yield redis_1.redis.set(decoded.user._id, JSON.stringify(decoded.user));
        res.status(201).json({
            success: true,
            message: "Password updated successfully",
            updates
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 400));
    }
});
exports.resetPassoword = resetPassoword;
//  get all users only for --> Admin
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userService_1.AllUsers)(res);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getAllUsers = getAllUsers;
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role } = req.body;
        const userExist = yield userModel_1.default.findOne({ email: email });
        if (!userExist) {
            return next(new errorHandeler_1.default("User not found with this Id", 400));
        }
        const user = yield userModel_1.default.findOneAndUpdate({ email: email }, { role: role }, { new: true });
        res.status(201).json({
            success: true,
            message: "User Role Update successfully",
            user
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.updateUserRole = updateUserRole;
//  delete user --Admin
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userModel_1.default.findById(id);
        if (!user) {
            return next(new errorHandeler_1.default("user not found with this Id", 400));
        }
        yield user.deleteOne({ id });
        yield redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.deleteUser = deleteUser;
