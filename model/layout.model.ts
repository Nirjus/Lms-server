import mongoose,{Document, Model, Schema} from "mongoose";

interface FaqItem extends Document{
    question: string,
    answer: string,
}

interface Category extends Document{
    title: string;
}
interface BannerImage extends Document{
    public_id: string,
    url:string,
}
interface Layout extends Document{
    type: string,
    faq: FaqItem[];
    category: Category[];
    banner:{
        image: BannerImage;
        title: string,
        subtitle: string,
    };
}
const faqSchema:Schema<FaqItem> = new mongoose.Schema({
  question:{
    type: String,
  },
  answer:{
    type: String,
  },
});

const categorySchema:Schema<Category> = new mongoose.Schema({
    title:{
        type: String,
    },
})

const bannerImageSchema:Schema<BannerImage> = new mongoose.Schema({
    public_id: {
        type: String,
    },
    url:{
        type: String,
    },
})

const layoutSchema:Schema<Layout> = new mongoose.Schema({
    type:{
        type: String
    },
    faq:[faqSchema],
    category:[categorySchema],
    banner:{
        image:bannerImageSchema,
        title: {
            type: String,
        },
        subtitle:{
            type: String
        },
    }
},{timestamps:true});

const LayoutModel:Model<Layout> = mongoose.model("Layout",layoutSchema);
export default LayoutModel;