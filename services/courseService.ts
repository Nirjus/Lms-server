import { Response } from "express";
import Course from "../model/courseModel";


//  create Course
export const createCourse = async (data: any, res: Response) => {
  
}

//  get all users --> Admin
export const AllCourses = async (res: Response) => {
    const courses = await Course.find().sort({createdAt: -1});

    res.status(201).json({
        success: true,
        message: "All users return successfully",
        courses,
    })
}