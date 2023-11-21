"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourse = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const courseModel_1 = __importDefault(require("../model/courseModel"));
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendEmail_1 = require("../helper/sendEmail");
const notificationModel_1 = __importDefault(require("../model/notificationModel"));
const courseService_1 = require("../services/courseService");
const axios_1 = __importDefault(require("axios"));
const secret_1 = require("../secret/secret");
//  upload course
const uploadCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "lmsCloude",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const course = yield courseModel_1.default.create(data);
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.uploadCourse = uploadCourse;
// edit course
const editCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = yield courseModel_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) {
            yield cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myClode = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "lmsCloude",
            });
            data.thumbnail = {
                public_id: myClode.public_id,
                url: myClode.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData === null || courseData === void 0 ? void 0 : courseData.thumbnail.public_id,
                url: courseData === null || courseData === void 0 ? void 0 : courseData.thumbnail.url,
            };
        }
        const course = yield courseModel_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        const isCatchExist = yield redis_1.redis.get(courseId);
        if (isCatchExist) {
            yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        }
        res.status(201).json({
            success: true,
            message: "course updated successfully",
            course,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.editCourse = editCourse;
// get single courses -- without parchese
const getSingleCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        const isCatchExist = yield redis_1.redis.get(courseId);
        if (isCatchExist) {
            const course = JSON.parse(isCatchExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = yield courseModel_1.default.findById(req.params.id).select("-courseData.videoUrl -courseData.links -courseData.questions -courseData.suggestion");
            yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getSingleCourse = getSingleCourse;
// get all courses --> without parchesing
const getAllCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModel_1.default.find().select("-courseData.videoUrl -courseData.links -courseData.questions -courseData.suggestion");
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getAllCourse = getAllCourse;
//  get courases -- only after parchese
const getCourseByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userCourseList = (_a = req.user) === null || _a === void 0 ? void 0 : _a.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.find((course) => course._id.toString() === courseId);
        if (!courseExists) {
            next(new errorHandeler_1.default("You are not parchesed this courses", 500));
        }
        const course = yield courseModel_1.default.findById(courseId);
        const content = course === null || course === void 0 ? void 0 : course.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getCourseByUser = getCourseByUser;
const addQuestion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { question, courseId, contentId } = req.body;
        const course = yield courseModel_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandeler_1.default("Invalid content Id", 400));
        }
        const courseContent = course === null || course === void 0 ? void 0 : course.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandeler_1.default("Invalid content Id", 400));
        }
        // new question Object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        //  add this question to our qourse content
        courseContent.questions.push(newQuestion);
        yield notificationModel_1.default.create({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            title: "New Question received",
            message: `You have a new question in ${courseContent === null || courseContent === void 0 ? void 0 : courseContent.title}`,
        });
        // save the updated course
        yield (course === null || course === void 0 ? void 0 : course.save());
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.addQuestion = addQuestion;
const addAnswer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f, _g, _h;
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = yield courseModel_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandeler_1.default("Invalid content ID", 400));
        }
        const courseContent = (_c = course === null || course === void 0 ? void 0 : course.courseData) === null || _c === void 0 ? void 0 : _c.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandeler_1.default("Invalid content ID", 400));
        }
        const question = (_d = courseContent === null || courseContent === void 0 ? void 0 : courseContent.questions) === null || _d === void 0 ? void 0 : _d.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new errorHandeler_1.default("Invalid question id", 400));
        }
        //  if question find then create answerobject
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        //  add this answer to our course content
        (_e = question.questionReplies) === null || _e === void 0 ? void 0 : _e.push(newAnswer);
        yield (course === null || course === void 0 ? void 0 : course.save());
        if (((_f = req.user) === null || _f === void 0 ? void 0 : _f._id) === ((_g = question.user) === null || _g === void 0 ? void 0 : _g._id)) {
            //  create a notification
            yield notificationModel_1.default.create({
                userId: (_h = req.user) === null || _h === void 0 ? void 0 : _h._id,
                title: "New reply recived",
                message: `You have a new reply in ${courseContent === null || courseContent === void 0 ? void 0 : courseContent.title}`
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };
            const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            const emailData = {
                email: question.user.email,
                subject: "Question Reply",
                html: html,
            };
            try {
                yield (0, sendEmail_1.sendMail)(emailData);
            }
            catch (error) {
                return next(new errorHandeler_1.default(error.message, 400));
            }
        }
        res.status(200).json({
            success: true,
            message: "Answer added successfully",
            course,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.addAnswer = addAnswer;
const addReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l;
    try {
        const userCourseList = (_j = req.user) === null || _j === void 0 ? void 0 : _j.courses;
        const courseId = req.params.id;
        // check if course exist? in user course list
        const courseExists = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.some((course) => course._id.toString() === courseId);
        if (!courseExists) {
            return next(new errorHandeler_1.default("You are not eligible to access this request", 404));
        }
        const course = yield courseModel_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            comment: review,
            rating: rating,
        };
        course === null || course === void 0 ? void 0 : course.reviews.push(reviewData);
        let avg = 0;
        course === null || course === void 0 ? void 0 : course.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        yield (course === null || course === void 0 ? void 0 : course.save());
        yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        yield notificationModel_1.default.create({
            userId: (_k = req.user) === null || _k === void 0 ? void 0 : _k._id,
            title: "New Review Received",
            message: `${(_l = req.user) === null || _l === void 0 ? void 0 : _l.name} has given a review in ${course === null || course === void 0 ? void 0 : course.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.addReview = addReview;
const addReplyToReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = yield courseModel_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandeler_1.default("Course not found", 400));
        }
        const review = (_m = course === null || course === void 0 ? void 0 : course.reviews) === null || _m === void 0 ? void 0 : _m.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandeler_1.default("Review not found", 400));
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        (_o = review.commentReplies) === null || _o === void 0 ? void 0 : _o.push(replyData);
        yield (course === null || course === void 0 ? void 0 : course.save());
        yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        res.status(200).json({
            success: true,
            course
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = addReplyToReview;
//  get all courses only for --> Admin
const getAllCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, courseService_1.AllCourses)(res);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getAllCourses = getAllCourses;
// delete course --Admin
const deleteCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield courseModel_1.default.findById(id);
        if (!course) {
            return next(new errorHandeler_1.default("Course not found with this Id", 400));
        }
        const imageData = course.thumbnail;
        if (imageData.public_id) {
            yield cloudinary_1.default.v2.uploader.destroy(imageData.public_id);
        }
        yield course.deleteOne();
        yield redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "Course deleted successfully!",
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.deleteCourse = deleteCourse;
//  generate video url
const generateVideoUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.body;
        const response = yield axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${secret_1.videoCyperAPISecret}`,
            },
        });
        res.status(201).json(response.data);
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.generateVideoUrl = generateVideoUrl;
