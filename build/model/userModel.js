"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        maxlength: [31, "Your name excide the maximum character"],
        minlength: [4, "your name must contain atlist 4 character"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        validate: {
            validator: function (v) {
                return emailRegexp.test(v);
            },
            message: "Plase enter your passoword",
        },
        unique: true,
    },
    password: {
        type: String,
        minlength: [6, "password atlist 6 character long"],
        set: (v) => bcryptjs_1.default.hashSync(v, bcryptjs_1.default.genSaltSync(10)),
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVarified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courceId: String,
        },
    ],
}, { timestamps: true });
const User = mongoose_1.default.model("user", userSchema);
exports.default = User;
