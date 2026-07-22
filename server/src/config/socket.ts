import { Server } from "socket.io";

let io: Server;


export default function setupSocket(server: any) {

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: [
                "GET",
                "POST",
                "PATCH",
                "DELETE"
            ]
        }
    });


    io.on("connection", (socket) => {

        console.log(
            "Client Connected"
        );

    });


    return io;
}


export { io };