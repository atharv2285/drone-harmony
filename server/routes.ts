import { Router, type Request, type Response } from "express";
import { streamRequestSchema } from "../shared/schema";
import { storage } from "./storage";
import { config } from "./config";
import { spawn } from "child_process";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/api/config", (req: Request, res: Response) => {
  res.json({
    iceServers: config.iceServers,
    videoSource: config.droneVideoSource,
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

router.get("/api/stream", (req: Request, res: Response) => {
  const sourceUrl = req.query.source as string || config.droneVideoSource;
  
  console.log(`Starting MJPEG stream from: ${sourceUrl}`);

  res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=--myboundary');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'close');

  const ffmpeg = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', sourceUrl,
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-q:v', '5',
    '-r', '15',
    'pipe:1'
  ]);

  ffmpeg.stdout.on('data', (data: Buffer) => {
    res.write('--myboundary\r\n');
    res.write('Content-Type: image/jpeg\r\n');
    res.write(`Content-Length: ${data.length}\r\n\r\n`);
    res.write(data);
    res.write('\r\n');
  });

  ffmpeg.stderr.on('data', (data: Buffer) => {
    console.error(`FFmpeg: ${data.toString()}`);
  });

  ffmpeg.on('close', (code: number) => {
    console.log(`FFmpeg process exited with code ${code}`);
    res.end();
  });

  ffmpeg.on('error', (error: Error) => {
    console.error('FFmpeg error:', error);
    res.status(500).end();
  });

  req.on('close', () => {
    console.log('Client disconnected, stopping FFmpeg');
    ffmpeg.kill('SIGTERM');
  });
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
