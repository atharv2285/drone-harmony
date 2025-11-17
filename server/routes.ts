import { Router, type Request, type Response } from "express";
import { streamRequestSchema } from "../shared/schema";
import { storage } from "./storage";
import { config } from "./config";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/api/config", (req: Request, res: Response) => {
  res.json({
    iceServers: config.iceServers,
  });
});

router.get("/api/telemetry", async (req: Request, res: Response) => {
  try {
    const telemetry = await storage.getTelemetry();
    res.json(telemetry);
  } catch (error) {
    console.error("Error fetching telemetry:", error);
    res.status(500).json({ error: "Failed to fetch telemetry" });
  }
});

router.post("/api/stream/start", async (req: Request, res: Response) => {
  try {
    const validation = streamRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid request body", details: validation.error });
    }

    const { droneIp, sourceType } = validation.data;
    
    const sourceUrl = sourceType === "rtsp" 
      ? `rtsp://${droneIp}/live`
      : sourceType === "mjpeg"
      ? `http://${droneIp}:8080/video`
      : `udp://${droneIp}:11111`;

    res.json({
      success: true,
      message: "Stream request received",
      sourceUrl,
      sourceType,
    });
  } catch (error) {
    console.error("Error starting stream:", error);
    res.status(500).json({ error: "Failed to start stream" });
  }
});

export default router;
