import mongoose from "mongoose";
import { mongoUri } from "../secret/secret";

 const connectDB = async () => {

    try {
       await mongoose.connect(mongoUri).then((res) => {
        console.log(`database is connected with ${res.connection.host}`)
       })
       mongoose.connection.on("error", (error:any) => {
        console.log(error);
       })
      
    } catch (error:any) {
        console.error(error.toString());    
    }
}

export default connectDB;