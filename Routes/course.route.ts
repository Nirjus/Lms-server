import express from "express";
import { addAnswer,
     addQuestion, 
     addReplyToReview, 
     addReview, 
     editCourse, 
     getAllCourse, 
     getCourseByUser, 
     getSingleCourse, 
     uploadCourse 
    } from "../controller/course.controller";
import { isLogin, validateRole } from "../middleware/userAuth";
const courseRouter = express.Router();

courseRouter.post("/create-course", isLogin, validateRole("admin"),uploadCourse);
courseRouter.put("/edit-course/:id", isLogin, validateRole("admin"),editCourse);

courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/getAll-course", getAllCourse);

courseRouter.get("/get-course-content/:id",isLogin, getCourseByUser);
courseRouter.put("/add-question", isLogin, addQuestion);
courseRouter.put("/add-answer", isLogin, addAnswer);
courseRouter.put("/add-review/:id", isLogin, addReview);
courseRouter.put("/add-reply", isLogin, validateRole("admin"),addReplyToReview);

export default courseRouter;