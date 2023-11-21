import { Server as SocketIOServer } from "socket.io";

import http from "http";

export const initSocketServer = (server: http.Server) => {
    const io = new SocketIOServer(server);

    io.on("connection", (socket) => {
        console.log("A user is connected");

        //listend for 'notefication event from the frontend
        socket.on("notification", (data) => {
           // brodcasting this data to all connected users
           io.emit("newNotefication", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        })
    })
}