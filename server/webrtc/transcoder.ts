import ffmpeg from "fluent-ffmpeg";
import { spawn } from "child_process";
import { EventEmitter } from "events";

export type VideoSourceType = "rtsp" | "mjpeg" | "udp";

export interface TranscoderOptions {
  sourceUrl: string;
  sourceType: VideoSourceType;
}

export class FFmpegTranscoder extends EventEmitter {
  private process: any = null;
  private options: TranscoderOptions;

  constructor(options: TranscoderOptions) {
    super();
    this.options = options;
  }

  start(): void {
    const args = this.buildFFmpegArgs();
    
    console.log(`Starting FFmpeg with args: ${args.join(" ")}`);
    
    this.process = spawn("ffmpeg", args);

    this.process.stdout.on("data", (data: Buffer) => {
      this.emit("data", data);
    });

    this.process.stderr.on("data", (data: Buffer) => {
      console.error(`FFmpeg stderr: ${data.toString()}`);
    });

    this.process.on("error", (error: Error) => {
      console.error("FFmpeg process error:", error);
      this.emit("error", error);
    });

    this.process.on("close", (code: number) => {
      console.log(`FFmpeg process exited with code ${code}`);
      this.emit("close", code);
    });
  }

  stop(): void {
    if (this.process) {
      this.process.kill("SIGTERM");
      this.process = null;
    }
  }

  private buildFFmpegArgs(): string[] {
    const { sourceUrl, sourceType } = this.options;
    
    const baseArgs = [
      "-i", sourceUrl,
      "-vcodec", "libx264",
      "-preset", "ultrafast",
      "-tune", "zerolatency",
      "-g", "20",
      "-sc_threshold", "0",
      "-b:v", "1500k",
      "-maxrate", "1500k",
      "-bufsize", "3000k",
    ];

    switch (sourceType) {
      case "rtsp":
        return [
          "-rtsp_transport", "tcp",
          ...baseArgs,
          "-f", "mpegts",
          "pipe:1",
        ];
      
      case "mjpeg":
        return [
          ...baseArgs,
          "-f", "mpegts",
          "pipe:1",
        ];
      
      case "udp":
        return [
          "-fflags", "nobuffer",
          ...baseArgs,
          "-f", "mpegts",
          "pipe:1",
        ];
      
      default:
        return [
          ...baseArgs,
          "-f", "mpegts",
          "pipe:1",
        ];
    }
  }
}
