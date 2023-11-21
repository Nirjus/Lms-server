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
exports.getLayout = exports.editLayout = exports.createLayout = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const layout_model_1 = __importDefault(require("../model/layout.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const createLayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.body;
        const isTypeExists = yield layout_model_1.default.findOne({ type: type });
        if (isTypeExists) {
            return next(new errorHandeler_1.default(`${type} already exists`, 400));
        }
        if (type === "Banner") {
            const { image, title, subtitle } = req.body;
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "lmsCloude",
            });
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subtitle,
            };
            yield layout_model_1.default.create({
                type: type,
                banner: banner
            });
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            yield layout_model_1.default.create({
                type: type,
                faq: faq
            });
        }
        if (type === "Category") {
            const { category } = req.body;
            yield layout_model_1.default.create({
                type: type,
                category: category
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.createLayout = createLayout;
// edit layout 
const editLayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const bannerdata = yield layout_model_1.default.findOne({ type: "Banner" });
            const { image, title, subtitle } = req.body;
            let banner = { image, title, subtitle };
            if (image) {
                if (image.startsWith("https")) {
                    banner.image = {
                        public_id: bannerdata.banner.image.public_id,
                        url: bannerdata.banner.image.url
                    };
                }
                else {
                    yield cloudinary_1.default.v2.uploader.destroy(bannerdata === null || bannerdata === void 0 ? void 0 : bannerdata.banner.image.public_id);
                    const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                        folder: "lmsCloude",
                    });
                    banner.image = {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    };
                }
            }
            if (title) {
                banner.title = title;
            }
            if (subtitle) {
                banner.subtitle = subtitle;
            }
            yield layout_model_1.default.findByIdAndUpdate(bannerdata.id, {
                type: type,
                banner: banner
            }, { new: true });
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqData = yield layout_model_1.default.findOne({ type: "FAQ" });
            yield layout_model_1.default.findByIdAndUpdate(faqData === null || faqData === void 0 ? void 0 : faqData._id, {
                type: type,
                faq: faq,
            });
        }
        if (type === "Category") {
            const { category } = req.body;
            const categoryData = yield layout_model_1.default.findOne({ type: "Category" });
            yield layout_model_1.default.findByIdAndUpdate(categoryData === null || categoryData === void 0 ? void 0 : categoryData._id, {
                type: type,
                category: category
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout Updated successfully",
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.editLayout = editLayout;
//  get alyout by type 
const getLayout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.params;
        const layout = yield layout_model_1.default.findOne({ type: type });
        if (!layout) {
            return next(new errorHandeler_1.default("Type not found", 400));
        }
        res.status(200).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.message, 500));
    }
});
exports.getLayout = getLayout;
