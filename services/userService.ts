import User from "../model/userModel"
import { Response } from "express";
import { redis } from "../utils/redis";

//  get user by id
export const getUserById = async (id:string, res:Response) => {
    const userJson = await redis.get(id);
   if(userJson){
    const user = JSON.parse(userJson); 

    return  res.status(200).json({
        success: true,
        message: "user return successfully",
        user,
    })
   }


}
//  get all users --> Admin
export const AllUsers = async (res: Response) => {
    const users = await User.find().sort({createdAt: -1});

    res.status(201).json({
        success: true,
        message: "All users return successfully",
        users,
    })
}