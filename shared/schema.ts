import { z } from "zod";

export const droneControlSchema = z.object({
  thrust: z.number().min(0).max(100),
  yaw: z.number().min(-180).max(180),
  roll: z.number().min(-45).max(45),
  pitch: z.number().min(-45).max(45),
});

export type DroneControl = z.infer<typeof droneControlSchema>;

export const droneTelemetrySchema = z.object({
  thrust: z.number(),
  yaw: z.number(),
  roll: z.number(),
  pitch: z.number(),
  battery: z.number().min(0).max(100),
  connected: z.boolean(),
});

export type DroneTelemetry = z.infer<typeof droneTelemetrySchema>;

export const signalingMessageSchema = z.union([
  z.object({
    type: z.literal("offer"),
    sdp: z.string(),
  }),
  z.object({
    type: z.literal("answer"),
    sdp: z.string(),
  }),
  z.object({
    type: z.literal("ice-candidate"),
    candidate: z.any(),
  }),
]);

export type SignalingMessage = z.infer<typeof signalingMessageSchema>;

export const streamRequestSchema = z.object({
  droneIp: z.string(),
  sourceType: z.enum(["rtsp", "mjpeg", "udp"]).default("rtsp"),
});

export type StreamRequest = z.infer<typeof streamRequestSchema>;
