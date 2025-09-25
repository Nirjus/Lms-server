import { Redis } from "ioredis";
import { redisUrl } from "../secret/secret";

const redisClient = () => {
  if (redisUrl) {
    console.log(`Redis connected`);
    return redisUrl;
  }
  throw new Error("Redis connection faild!");
};

export const redis = new Redis(redisClient());

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

redis.on("end", () => {
  console.warn("⚠️ Redis connection closed");
});
