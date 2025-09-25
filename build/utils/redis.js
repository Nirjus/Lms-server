"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const secret_1 = require("../secret/secret");
const redisClient = () => {
    if (secret_1.redisUrl) {
        console.log(`Redis connected`);
        return secret_1.redisUrl;
    }
    throw new Error("Redis connection faild!");
};
exports.redis = new ioredis_1.Redis(redisClient());
exports.redis.on("connect", () => {
    console.log("✅ Redis connected");
});
exports.redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
});
exports.redis.on("end", () => {
    console.warn("⚠️ Redis connection closed");
});
