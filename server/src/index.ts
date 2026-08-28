import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env";
import { eventBus, Events } from "./events/eventBus";
import { startPriceMonitor } from "./services/priceMonitor";
import healthRouter from "./routes/health";
import stocksRouter from "./routes/stocks";
import marketRouter from "./routes/market";
import tradingRouter from "./routes/trading";
import portfolioRouter from "./routes/portfolio";
import triggersRouter from "./routes/triggers";
import notificationsRouter from "./routes/notifications";

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: env.clientUrl,
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/market", marketRouter);
app.use("/api/trading", tradingRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/triggers", triggersRouter);
app.use("/api/notifications", notificationsRouter);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join", (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined room user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

eventBus.on(Events.TRIGGER_EXECUTED, (data) => {
  io.to(`user:${data.userId}`).emit("notification", {
    type: data.type,
    title: data.title,
    message: data.message,
  });
});

export { io };

server.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  startPriceMonitor();
});
