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
exports.getOrderAnalytics = exports.getCoursesAnalytics = exports.getUserAnalytics = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const analytics_generater_1 = require("../utils/analytics.generater");
const userModel_1 = __importDefault(require("../model/userModel"));
const courseModel_1 = __importDefault(require("../model/courseModel"));
const orderModel_1 = __importDefault(require("../model/orderModel"));
// user analytics --Admin
const getUserAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAnalytic = yield (0, analytics_generater_1.generateLast12monthData)(userModel_1.default);
        res.status(200).json({
            success: true,
            userAnalytic,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getUserAnalytics = getUserAnalytics;
//   course analytics --Admin
const getCoursesAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseAnalytic = yield (0, analytics_generater_1.generateLast12monthData)(courseModel_1.default);
        res.status(200).json({
            success: true,
            courseAnalytic,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getCoursesAnalytics = getCoursesAnalytics;
//  order analytics --Admin
const getOrderAnalytics = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderAnalytic = yield (0, analytics_generater_1.generateLast12monthData)(orderModel_1.default);
        res.status(200).json({
            success: true,
            orderAnalytic,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getOrderAnalytics = getOrderAnalytics;
