import express, { Application, Request, Response } from "express";
import http, { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import cors from "cors";

class SocketServer {
    private readonly app: Application;
    private readonly httpServer: Server;
    private io: IOServer;
    private readonly port: number;

    constructor(port?: number) {
        this.port = port || Number(process.env.PORT) || 3000;

        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new IOServer(this.httpServer, {
            cors: { origin: "*", methods: ["GET", "POST"] },
        });

        this.app.use(cors());

        this.configureRoutes();
        this.configureSocketEvents();
    }

    private configureRoutes(): void {
        this.app.get("/", (_req: Request, res: Response) => {
            res.send("Server is running");
        });
    }

    public start(): void {
        this.httpServer.listen(this.port, () =>
            console.log(`Server listening on port ${this.port}`)
        );
    }

    private configureSocketEvents(): void {
        this.io.on("connection", (socket: Socket) => {
            console.log(`[connect] socket.id=${socket.id}`);

            this.sendWelcomeMessage(socket);
            this.notifyOthersAboutConnection(socket);

            socket.on("client-message", (message: string) =>
                this.handleClientMessage(socket, message)
            );

            socket.on("disconnect", () => this.handleDisconnect(socket));
        });
    }

    private sendWelcomeMessage(socket: Socket): void {
        socket.emit("server-message", "Добро пожаловать!");
    }

    private notifyOthersAboutConnection(socket: Socket): void {
        socket.broadcast.emit("server-message", "Пользователь подключился");
    }

    private handleClientMessage(socket: Socket, message: string): void {
        console.log(`[message] from=${socket.id}, data=${message}`);

        socket.emit("server-message", `You: ${message}`);

        socket.broadcast.emit("server-message", message);
    }

    private handleDisconnect(socket: Socket): void {
        console.log(`[disconnect] socket.id=${socket.id}`);
        socket.broadcast.emit("server-message", "Пользователь отключился");
    }
}

new SocketServer().start();
