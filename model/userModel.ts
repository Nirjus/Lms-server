import mongoose, { Model, Schema,Document } from "mongoose";
import bcrypt from "bcryptjs";
const emailRegexp: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVarified: boolean;
  courses: Array<{ courseId: string }>;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [31, "Your name excide the maximum character"],
      minlength: [4, "your name must contain atlist 4 character"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      validate:{
        validator: function(v:string){
          return emailRegexp.test(v);
        },
        message:"Plase enter your passoword",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "password atlist 6 character long"],
      set:(v:string) => bcrypt.hashSync(v,bcrypt.genSaltSync(10)),
      select:false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courceId: String,
      },
    ],
  },
  { timestamps: true }
);


const User: Model<IUser> = mongoose.model("user", userSchema);
export default User;
