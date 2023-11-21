"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const secret_1 = require("./secret/secret");
const userRoute_1 = __importDefault(require("./Routes/userRoute"));
const userAuthRoute_1 = __importDefault(require("./Routes/userAuthRoute"));
const course_route_1 = __importDefault(require("./Routes/course.route"));
const order_route_1 = __importDefault(require("./Routes/order.route"));
const notification_route_1 = __importDefault(require("./Routes/notification.route"));
const analytics_route_1 = __importDefault(require("./Routes/analytics.route"));
const layout_route_1 = __importDefault(require("./Routes/layout.route"));
const payment_route_1 = __importDefault(require("./Routes/payment.route"));
//body parser 
exports.app.use(express_1.default.json({ limit: "50mb" }));
//  cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors
exports.app.use((0, cors_1.default)({
    origin: [secret_1.frontendUrl],
    credentials: true,
}));
exports.app.use((0, morgan_1.default)("dev"));
//  routes
exports.app.use("/api/v1/user", userRoute_1.default);
exports.app.use("/api/v1/auth", userAuthRoute_1.default);
exports.app.use("/api/v1/course", course_route_1.default);
exports.app.use("/api/v1/order", order_route_1.default);
exports.app.use("/api/v1/notification", notification_route_1.default);
exports.app.use("/api/v1/analytic", analytics_route_1.default);
exports.app.use("/api/v1/layout", layout_route_1.default);
exports.app.use("/api/v1/payment", payment_route_1.default);
// testing api root
exports.app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is connected."
    });
});
// unknown roots
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.errorMiddleware);
