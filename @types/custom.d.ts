import { Request } from "express";
import { IUser } from "../model/userModel";


interface CustomRequest extends Request {
    user?: IUser; // Replace IUser with your user type
}