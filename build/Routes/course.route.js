"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../controller/course.controller");
const userAuth_1 = require("../middleware/userAuth");
const courseRouter = express_1.default.Router();
courseRouter.post("/create-course", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), course_controller_1.uploadCourse);
courseRouter.put("/edit-course/:id", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), course_controller_1.editCourse);
courseRouter.get("/get-course/:id", course_controller_1.getSingleCourse);
courseRouter.get("/getAll-course", course_controller_1.getAllCourse);
courseRouter.get("/get-course-content/:id", userAuth_1.isLogin, course_controller_1.getCourseByUser);
courseRouter.put("/add-question", userAuth_1.isLogin, course_controller_1.addQuestion);
courseRouter.put("/add-answer", userAuth_1.isLogin, course_controller_1.addAnswer);
courseRouter.put("/add-review/:id", userAuth_1.isLogin, course_controller_1.addReview);
courseRouter.put("/add-reply", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), course_controller_1.addReplyToReview);
courseRouter.get("/get-all-courses", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), course_controller_1.getAllCourses);
courseRouter.post("/getVdoCipherOTP", course_controller_1.generateVideoUrl);
courseRouter.delete("/delete-course/:id", userAuth_1.isLogin, (0, userAuth_1.validateRole)("admin"), course_controller_1.deleteCourse);
exports.default = courseRouter;
