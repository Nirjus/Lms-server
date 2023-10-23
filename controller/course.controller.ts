import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import cloudinary from "cloudinary";
import Course from "../model/courseModel";
import { redis } from "../utils/redis";
import { CustomRequest } from "../@types/custom";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../helper/sendEmail";
import Notification from "../model/notificationModel";
import { AllCourses } from "../services/courseService";
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
//  add question in querse
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, courseId, contentId }: IAddQuestionData = req.body;
    const course = await Course.findById(courseId);

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content Id", 400));
    }
    const courseContent = course?.courseData.find((item: any) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new ErrorHandler("Invalid content Id", 400));
    }
    // new question Object
    const newQuestion: any = {
      user: (req as CustomRequest).user,
      question,
      questionReplies: [],
    };
    //  add this question to our qourse content
    courseContent.questions.push(newQuestion);
    await Notification.create({
      userId: (req as CustomRequest).user?._id,
      title: "New Question received",
      message: `You have a new question in ${courseContent?.title}`,
    })
    // save the updated course
    await course?.save();
    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
//  now answer question
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export const addAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { answer, courseId, contentId, questionId } =
      req.body as IAddAnswerData;
    const course = await Course.findById(courseId);

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return next(new ErrorHandler("Invalid content ID", 400));
    }
    const courseContent = course?.courseData?.find((item: any) =>
      item._id.equals(contentId)
    );
    if (!courseContent) {
      return next(new ErrorHandler("Invalid content ID", 400));
    }

    const question = courseContent?.questions?.find((item: any) =>
      item._id.equals(questionId)
    );

    if (!question) {
      return next(new ErrorHandler("Invalid question id", 400));
    }
    //  if question find then create answerobject
    const newAnswer: any = {
      user: (req as CustomRequest).user,
      answer,
    };
    //  add this answer to our course content
    question.questionReplies?.push(newAnswer);

    await course?.save();
    if ((req as CustomRequest).user?._id === question.user?._id) {
      //  create a notification
      await Notification.create({
      userId: (req as CustomRequest).user?._id,
        title: "New reply recived",
        message: `You have a new reply in ${courseContent?.title}`
      })
    } else {
      const data = {
        name: question.user.name,
        title: courseContent.title,
      };
      const html: string = await ejs.renderFile(
        path.join(__dirname, "../mails/question-reply.ejs"),
        data
      );
      const emailData = {
        email: question.user.email,
        subject: "Question Reply",
        html: html,
      };

      try {
        await sendMail(emailData);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
    res.status(200).json({
      success: true,
      message: "Answer added successfully",
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
//  add review in course
interface IAddReviewData {
  review: string;
  courseId: string;
  rating: number;
  usreId: string;
}
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userCourseList = (req as CustomRequest).user?.courses;
    const courseId = req.params.id;

    // check if course exist? in user course list
    const courseExists = userCourseList?.some(
      (course: any) => course._id.toString() === courseId
    );

    if (!courseExists) {
      return next(
        new ErrorHandler("You are not eligible to access this request", 404)
      );
    }
    const course = await Course.findById(courseId);

    const { review, rating } = req.body as IAddReviewData;

    const reviewData: any = {
      user: (req as CustomRequest).user,
      comment: review,
      rating: rating,
    };
    course?.reviews.push(reviewData);

    let avg = 0;
    course?.reviews.forEach((rev: any) => {
      avg += rev.rating;
    });
    if (course) {
      course.ratings = avg / course.reviews.length;
    }
    await course?.save();
    const notification = {
      title: "New Review Received",
      message: `${(req as CustomRequest).user?.name} has given a review in ${
        course?.name
      }`,
    };

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

//   add reply to review
interface IAddReplyReviewData{
  comment: string,
  courseId: string,
  reviewId: string,
}
export const addReplyToReview = async (req: Request, res:Response, next: NextFunction) => {

  try {
      const {comment, courseId, reviewId} = req.body as IAddReplyReviewData;

      const course = await Course.findById(courseId);
      if(!course){
        return next(new ErrorHandler("Course not found",400));
      }
      const review = course?.reviews?.find((rev: any) => rev._id.toString() === reviewId);

      if(!review){
        return next(new ErrorHandler("Review not found", 400));
      }
      const replyData: any ={
        user: (req as CustomRequest).user,
        comment,
      }
      if(!review.commentReplies){
        review.commentReplies = [];
      }
     review.commentReplies?.push(replyData);

      await course?.save();
      res.status(200).json({
        success: true,
        course
      })
  } catch (error: any) {
    return next(new ErrorHandler(error.message,500));
  }
} 
//  get all courses only for --> Admin
export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AllCourses(res);
  } catch (error: any) {
      return next(new ErrorHandler(error.message,500));
  }
}
// delete course --Admin
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const {id} = req.params;
      const course = await Course.findByIdAndDelete(id);
      if(!course){
        return next(new ErrorHandler("Course not found with this Id",400));
      }
      await redis.del(id);
      
      res.status(200).json({
        success: true,
        message: "Course deleted successfully!",
      })
  } catch (error: any) {
    return next(new ErrorHandler(error.message,500));
  }
}