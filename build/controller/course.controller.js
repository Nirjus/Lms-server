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
exports.deleteCourse = exports.getAllCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourse = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
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
const userModel_1 = __importDefault(require("../model/userModel"));
//  upload course
const uploadCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const demoUrl = data === null || data === void 0 ? void 0 : data.demoUrl;
        if (thumbnail) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "lmsCloude",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (demoUrl) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(demoUrl, {
                folder: "lmsCloude",
                resource_type: "video",
            });
            data.demoUrl = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        for (let i = 0; i < ((_a = data === null || data === void 0 ? void 0 : data.courseData) === null || _a === void 0 ? void 0 : _a.length); i++) {
            const videoUrl = data === null || data === void 0 ? void 0 : data.courseData[i].videoUrl;
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(videoUrl, {
                folder: "lmsCloude",
                resource_type: "video",
            });
            data.courseData[i].videoUrl = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const course = yield courseModel_1.default.create(data);
        const user = yield userModel_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        const courseExists = user === null || user === void 0 ? void 0 : user.createItems.some((courseId) => courseId._id.toString() === course._id);
        if (courseExists) {
            return next(new errorHandeler_1.default("This course is already created by you!", 500));
        }
        user === null || user === void 0 ? void 0 : user.createItems.push({
            courseId: course._id,
        });
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(user));
        yield (user === null || user === void 0 ? void 0 : user.save());
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
    var _c, _d, _e, _f;
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const demoUrl = data === null || data === void 0 ? void 0 : data.demoUrl;
        const courseId = req.params.id;
        const courseData = yield courseModel_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) {
            if (courseData === null || courseData === void 0 ? void 0 : courseData.thumbnail.public_id) {
                yield cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            }
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
        if (demoUrl && !demoUrl.startsWith("https")) {
            if (courseData === null || courseData === void 0 ? void 0 : courseData.demoUrl.public_id) {
                yield cloudinary_1.default.v2.uploader.destroy(courseData.demoUrl.public_id, {
                    resource_type: "video",
                });
            }
            const myClode = yield cloudinary_1.default.v2.uploader.upload(demoUrl, {
                folder: "lmsCloude",
                resource_type: "video",
            });
            data.demoUrl = {
                public_id: myClode.public_id,
                url: myClode.secure_url,
            };
        }
        if (demoUrl.startsWith("https")) {
            data.demoUrl = {
                public_id: (_c = courseData === null || courseData === void 0 ? void 0 : courseData.demoUrl) === null || _c === void 0 ? void 0 : _c.public_id,
                url: (_d = courseData === null || courseData === void 0 ? void 0 : courseData.demoUrl) === null || _d === void 0 ? void 0 : _d.url,
            };
        }
        for (let i = 0; i < ((_e = data === null || data === void 0 ? void 0 : data.courseData) === null || _e === void 0 ? void 0 : _e.length); i++) {
            const videoUrl = (_f = data === null || data === void 0 ? void 0 : data.courseData[i]) === null || _f === void 0 ? void 0 : _f.videoUrl;
            if (videoUrl && !videoUrl.startsWith("https")) {
                if (courseData === null || courseData === void 0 ? void 0 : courseData.courseData[i].videoUrl.public_id) {
                    yield cloudinary_1.default.v2.uploader.destroy(courseData === null || courseData === void 0 ? void 0 : courseData.courseData[i].videoUrl.public_id, {
                        resource_type: "video",
                    });
                }
                const myClode = yield cloudinary_1.default.v2.uploader.upload(videoUrl, {
                    folder: "lmsCloude",
                    resource_type: "video",
                });
                data.courseData[i].videoUrl = {
                    public_id: myClode.public_id,
                    url: myClode.secure_url,
                };
            }
            if (videoUrl.startsWith("https")) {
                data.courseData[i].videoUrl = {
                    public_id: courseData === null || courseData === void 0 ? void 0 : courseData.courseData[i].videoUrl.public_id,
                    url: courseData === null || courseData === void 0 ? void 0 : courseData.courseData[i].videoUrl.url,
                };
            }
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
    var _g;
    try {
        const userCourseList = (_g = req.user) === null || _g === void 0 ? void 0 : _g.courses;
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
    var _h;
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
            userId: (_h = req.user) === null || _h === void 0 ? void 0 : _h._id,
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
    var _j, _k, _l, _m, _o, _p;
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = yield courseModel_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandeler_1.default("Invalid content ID", 400));
        }
        const courseContent = (_j = course === null || course === void 0 ? void 0 : course.courseData) === null || _j === void 0 ? void 0 : _j.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandeler_1.default("Invalid content ID", 400));
        }
        const question = (_k = courseContent === null || courseContent === void 0 ? void 0 : courseContent.questions) === null || _k === void 0 ? void 0 : _k.find((item) => item._id.equals(questionId));
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
        (_l = question.questionReplies) === null || _l === void 0 ? void 0 : _l.push(newAnswer);
        yield (course === null || course === void 0 ? void 0 : course.save());
        if (((_m = req.user) === null || _m === void 0 ? void 0 : _m._id) === ((_o = question.user) === null || _o === void 0 ? void 0 : _o._id)) {
            //  create a notification
            yield notificationModel_1.default.create({
                userId: (_p = req.user) === null || _p === void 0 ? void 0 : _p._id,
                title: "New reply recived",
                message: `You have a new reply in ${courseContent === null || courseContent === void 0 ? void 0 : courseContent.title}`,
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
    var _q, _r, _s;
    try {
        const userCourseList = (_q = req.user) === null || _q === void 0 ? void 0 : _q.courses;
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
            userId: (_r = req.user) === null || _r === void 0 ? void 0 : _r._id,
            title: "New Review Received",
            message: `${(_s = req.user) === null || _s === void 0 ? void 0 : _s.name} has given a review in ${course === null || course === void 0 ? void 0 : course.name}`,
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
    var _t, _u;
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = yield courseModel_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandeler_1.default("Course not found", 400));
        }
        const review = (_t = course === null || course === void 0 ? void 0 : course.reviews) === null || _t === void 0 ? void 0 : _t.find((rev) => rev._id.toString() === reviewId);
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
        (_u = review.commentReplies) === null || _u === void 0 ? void 0 : _u.push(replyData);
        yield (course === null || course === void 0 ? void 0 : course.save());
        yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        res.status(200).json({
            success: true,
            course,
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
    var _v, _w, _x;
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
        const demoUrl = course === null || course === void 0 ? void 0 : course.demoUrl;
        if (demoUrl.public_id) {
            yield cloudinary_1.default.v2.uploader.destroy(demoUrl === null || demoUrl === void 0 ? void 0 : demoUrl.public_id, {
                resource_type: "video",
            });
        }
        for (let i = 0; i < ((_v = course === null || course === void 0 ? void 0 : course.courseData) === null || _v === void 0 ? void 0 : _v.length); i++) {
            if ((_w = course.courseData[i].videoUrl) === null || _w === void 0 ? void 0 : _w.public_id) {
                yield cloudinary_1.default.v2.uploader.destroy((_x = course.courseData[i].videoUrl) === null || _x === void 0 ? void 0 : _x.public_id, {
                    resource_type: "video",
                });
            }
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
