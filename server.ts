import { app } from "./app";
import { cloudinaryApiKey, cloudinaryApiSecret, cloudinaryName, port } from "./secret/secret";
import connectDB from "./utils/db";
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
})

app.listen(port, async () => {
    console.log(`server is running on http://localhost:${port}`);
   await connectDB();
});