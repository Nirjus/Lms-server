import { app } from "./app";
import {
  backendUrl,
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryName,
  port,
} from "./secret/secret";
import { initSocketServer } from "./socketServer";
import connectDB from "./utils/db";
import cloudinary from "cloudinary";
import http from "http";
const server = http.createServer(app);

cloudinary.v2.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

initSocketServer(server);

server.listen(port, async () => {
  console.log(`server is running on http://localhost:${port}`);
  await connectDB();
});

