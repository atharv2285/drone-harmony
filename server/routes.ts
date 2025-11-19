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
  const droneIp = req.query.droneIp as string;
  const sourceType = (req.query.sourceType as string) || 'rtsp';
  const useTestPattern = req.query.test === 'true';
  const useDemoStream = req.query.demo === 'true';

  let sourceUrl: string;

  if (useTestPattern) {
    sourceUrl = 'test';
  } else if (useDemoStream) {
    // Public demo RTSP stream - Big Buck Bunny
    sourceUrl = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4';
  } else if (droneIp) {
    // Construct source URL based on type and drone IP
    switch (sourceType) {
      case 'rtsp':
        sourceUrl = `rtsp://${droneIp}/live`;
        break;
      case 'mjpeg':
        sourceUrl = `http://${droneIp}:8080/video`;
        break;
      case 'udp':
        sourceUrl = `udp://${droneIp}:11111`;
        break;
      case 'direct':
        // Direct HTTP stream (e.g., http://192.168.137.18/)
        sourceUrl = `http://${droneIp}/`;
        break;
      default:
        sourceUrl = `rtsp://${droneIp}/live`;
    }
  } else {
    sourceUrl = config.droneVideoSource;
  }

  const streamType = useDemoStream ? 'demo stream' : useTestPattern ? 'test pattern' : sourceUrl;
  console.log(`Starting MJPEG stream from: ${streamType}`);

  res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=--myboundary');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'close');

  let ffmpegArgs: string[];

  if (useTestPattern) {
    ffmpegArgs = [
      '-f', 'lavfi',
      '-i', 'testsrc=size=640x480:rate=15',
      '-f', 'lavfi',
      '-i', 'sine=frequency=1000:sample_rate=48000',
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-q:v', '5',
      'pipe:1'
    ];
  } else {
    ffmpegArgs = [
      '-rtsp_transport', 'tcp',
      '-i', sourceUrl,
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-q:v', '5',
      '-r', '15',
      'pipe:1'
    ];
  }

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  let frameBuffer = Buffer.alloc(0);
  const JPEG_SOI = Buffer.from([0xFF, 0xD8]);
  const JPEG_EOI = Buffer.from([0xFF, 0xD9]);

  ffmpeg.stdout.on('data', (chunk: Buffer) => {
    frameBuffer = Buffer.concat([frameBuffer, chunk]);

    while (true) {
      const soiIndex = frameBuffer.indexOf(JPEG_SOI);
      if (soiIndex === -1) break;

      const eoiIndex = frameBuffer.indexOf(JPEG_EOI, soiIndex + 2);
      if (eoiIndex === -1) break;

      const frame = frameBuffer.slice(soiIndex, eoiIndex + 2);
      frameBuffer = frameBuffer.slice(eoiIndex + 2);

      res.write('--myboundary\r\n');
      res.write('Content-Type: image/jpeg\r\n');
      res.write(`Content-Length: ${frame.length}\r\n\r\n`);
      res.write(frame);
      res.write('\r\n');
    }
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
