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
exports.AllUsers = exports.getUserById = void 0;
const userModel_1 = __importDefault(require("../model/userModel"));
const redis_1 = require("../utils/redis");
//  get user by id
const getUserById = (id, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userJson = yield redis_1.redis.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        return res.status(200).json({
            success: true,
            message: "user return successfully",
            user,
        });
    }
});
exports.getUserById = getUserById;
//  get all users --> Admin
const AllUsers = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        message: "All users return successfully",
        users,
    });
});
exports.AllUsers = AllUsers;
