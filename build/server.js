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
const app_1 = require("./app");
const secret_1 = require("./secret/secret");
const socketServer_1 = require("./socketServer");
const db_1 = __importDefault(require("./utils/db"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app_1.app);
cloudinary_1.default.v2.config({
    cloud_name: secret_1.cloudinaryName,
    api_key: secret_1.cloudinaryApiKey,
    api_secret: secret_1.cloudinaryApiSecret,
});
(0, socketServer_1.initSocketServer)(server);
server.listen(secret_1.port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`server is running on http://localhost:${secret_1.port}`);
    yield (0, db_1.default)();
}));
