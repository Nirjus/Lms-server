import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";

import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error";
import { frontendUrl } from "./secret/secret";
import userRouter from "./Routes/userRoute";
import userAuthRouter from "./Routes/userAuthRoute";

//body parser 
app.use(express.json({ limit: "50mb" }));

//  cookie parser
app.use(cookieParser());

// cors
app.use(cors({
    origin: frontendUrl,
}))

//  routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/auth",userAuthRouter);

// testing api root
app.get("/test", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Backend is connected."
    })
});

// unknown roots
app.all("*", (req:Request, res:Response, next:NextFunction) => {
const err = new Error(`Route ${req.originalUrl} not found`) as any;
err.statusCode = 404;
next(err);
})

app.use(errorMiddleware);