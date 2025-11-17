import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config";
import routes from "./routes";
import { signalingServer } from "./webrtc/signaling";
import { droneControlProxy } from "./ws/control";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

const staticPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(staticPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const type = url.searchParams.get("type") || "control";
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (type === "signaling") {
    signalingServer.handleConnection(ws, sessionId);
  } else {
    droneControlProxy.handleConnection(ws, sessionId);
  }
});

server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Drone Video Streaming Server         ║
╠════════════════════════════════════════╣
║   Server running on port ${config.port}       ║
║   http://localhost:${config.port}             ║
╠════════════════════════════════════════╣
║   WebSocket Endpoints:                 ║
║   - Control: ws://localhost:${config.port}/ws  ║
║   - Signaling: ws://localhost:${config.port}/ws║
║                ?type=signaling         ║
╠════════════════════════════════════════╣
║   Default Drone IP: ${config.droneIp}     ║
║   Video Source: ${config.droneVideoSource.slice(0, 20)}...  ║
╚════════════════════════════════════════╝
  `);
});

export default app;
