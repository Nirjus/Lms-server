"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    //   mongodb error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new errorHandeler_1.default(message, 400);
    }
    // duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new errorHandeler_1.default(message, 400);
    }
    //  jwt error
    if (err.name === "JsonWebTokenError") {
        const message = "Json web token is invalid, try again";
        err = new errorHandeler_1.default(message, 400);
    }
    //  jwt expaired error
    if (err.name === "TokenExpiredError") {
        const message = "Json web token is expired, try again";
        err = new errorHandeler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.errorMiddleware = errorMiddleware;
