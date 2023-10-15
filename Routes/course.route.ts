import express from "express";
import { editCourse, getAllCourse, getCourseByUser, getSingleCourse, uploadCourse } from "../controller/course.controller";
import { isLogin, validateRole } from "../middleware/userAuth";
const courseRouter = express.Router();

courseRouter.post("/create-course", isLogin, validateRole("admin"),uploadCourse);
courseRouter.put("/edit-course/:id", isLogin, validateRole("admin"),editCourse);

courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/getAll-course", getAllCourse);

courseRouter.get("/get-course-content/:id",isLogin, getCourseByUser);

export default courseRouter;