import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import LayoutModel from "../model/layout.model";
import cloudinary from "cloudinary";

export const createLayout = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const {type} = req.body;
        const isTypeExists = await LayoutModel.findOne({type:type});
        if(isTypeExists){
            return next(new ErrorHandler(`${type} already exists`,400));
        }
        if(type === "Banner"){
            const {image, title, subtitle} = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:"lmsCloude",
            })
            const banner ={
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subtitle,
            }
            await LayoutModel.create({
                type:type,
                banner:banner
            });
        }
            if(type === "FAQ"){
                const {faq} = req.body;
                await LayoutModel.create({
                    type:type,
                    faq:faq
                });
            }
            if(type === "Category"){
                const {category} = req.body;
                await LayoutModel.create({
                    type:type,
                    category:category
                });
            }
        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500))
    }
}
// edit layout 
export const editLayout = async (req: Request, res:Response, next: NextFunction) => {
    try {
        const {type} = req.body;
        
        if(type === "Banner"){
            const bannerdata = await LayoutModel.findOne({type:"Banner"}) as any;
            const {image, title, subtitle} = req.body;
            let banner = {image,title,subtitle};
            if(image){
                if(image.startsWith("https")){
                    banner.image ={
                        public_id: bannerdata.banner.image.public_id,
                        url: bannerdata.banner.image.url
                    }
                }else{
            await cloudinary.v2.uploader.destroy(bannerdata?.banner.image.public_id);
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:"lmsCloude",
            })    
            banner.image = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
            }
        }
        }
           if(title){
            banner.title = title;
           }
             if(subtitle){
                banner.subtitle = subtitle;
             }
            
            await LayoutModel.findByIdAndUpdate(bannerdata.id,{
                type:type,
                banner:banner
            },{new:true});
        }
            if(type === "FAQ"){
                const {faq} = req.body;
                const faqData = await LayoutModel.findOne({type:"FAQ"});
                await LayoutModel.findByIdAndUpdate(faqData?._id,{
                    type:type,
                    faq:faq,
                });
            }
            if(type === "Category"){
                const {category} = req.body;
                const categoryData = await LayoutModel.findOne({type: "Category"});
                await LayoutModel.findByIdAndUpdate(categoryData?._id,{
                    type:type,
                    category:category
                });
            }
        res.status(200).json({
            success: true,
            message: "Layout Updated successfully",
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500))
    }
}
//  get alyout by type 
export const getLayout = async (req: Request,res: Response, next: NextFunction) => {
    try {
        const {type} = req.params;
        const layout = await LayoutModel.findOne({type:type});
        if(!layout){
            return next(new ErrorHandler("Type not found",400));
        }
        res.status(200).json({
            success: true,
            layout,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500));
    }
}