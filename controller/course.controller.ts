import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import cloudinary from "cloudinary";
import Course from "../model/courseModel";
import { redis } from "../utils/redis";
import { CustomRequest } from "../@types/custom";
//  upload course
export const uploadCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "lmsCloude",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const course = await Course.create(data);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// edit course
export const editCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);
      const myClode = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "lmsCloude",
      });

      data.thumbnail = {
        public_id: myClode.public_id,
        url: myClode.secure_url,
      };
    }

    const courseId = req.params.id;

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $set: data,
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "course updated successfully",
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// get single courses -- without parchese
export const getSingleCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.params.id;
    const isCatchExist = await redis.get(courseId);

    if (isCatchExist) {
      const course = JSON.parse(isCatchExist);
      res.status(200).json({
        success: true,
        course,
      });
    } else {
      const course = await Course.findById(req.params.id).select(
        "-courseData.videoUrl -courseData.links -courseData.questions -courseData.suggestion"
      );
      await redis.set(courseId, JSON.stringify(course));
      res.status(200).json({
        success: true,
        course,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// get all courses --> without parchesing
export const getAllCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isCatchExist = await redis.get("allCourses");
    if (isCatchExist) {
      const courses = JSON.parse(isCatchExist);

      res.status(200).json({
        success: true,
        courses,
      });
    } else {
      const courses = await Course.find().select(
        "-courseData.videoUrl -courseData.links -courseData.questions -courseData.suggestion"
      );
      await redis.set("allCourses", JSON.stringify(courses));

      res.status(200).json({
        success: true,
        courses,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
//  get courases -- only after parchese
export const getCourseByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userCourseList = (req as CustomRequest).user?.courses;
    const courseId = req.params.id;
    const courseExists = userCourseList?.find(
      (course: any) => course._id.toString() === courseId
    );

    if (!courseExists) {
      next(new ErrorHandler("You are not parchesed this courses", 500));
    }
    const course = await Course.findById(courseId);
    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
