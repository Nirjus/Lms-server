import mongoose,{Document,Model, Schema} from "mongoose";

interface IComment extends Document{
    user: object,
    comment: string,
    commentReplies?: IComment[],
}

interface IReview extends Document{
    user:object,
    rating: number,
    comment: string,
    commentReplies: IComment[],
}

interface ILink extends Document{
    title: string;
    url: string;
}

interface ICourseData extends Document{
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail:object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink;
    suggestion: string;
    questions: IComment[];
}

interface Icourse extends Document{
    name: string;
    description?:string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags:string;
    level: string;
    demoUrl: string;
    benefits: {title: string}[];
    prerequisites: {title: string}[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings: number;
    purchased?: number;
}

const reviewSchema: Schema<IReview> = new mongoose.Schema({
   user:Object,
   rating: {
    type: Number,
    default: 0,
   },
   comment: String,
})

const linkSchema: Schema<ILink> = new mongoose.Schema({
    title: String,
    url: String,
})

const commentsSchema = new Schema<IComment>({
    user: Object,
    comment: String,
    commentReplies: [Object],
})

const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentsSchema],
})

const courseSchema: Schema<Icourse> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id:{
            type: String,
        },
        url:{
            type: String,
        },
    },
    tags:{
        type:String,
        required:true,
    },
    level:{
        type: String,
        required: true,
    },
    demoUrl:{
        type:String,
        required:true,
    },
    benefits: [{title: String}],
    prerequisites: [{title: String}],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased:{
        type: Number,
        default: 0,
    }
})

const Course: Model<Icourse> = mongoose.model("Course", courseSchema);

export default Course;