import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  droneVideoSource: process.env.DRONE_VIDEO_SOURCE || "rtsp://184.72.239.149/vod/mp4:BigBuckBunny_175k.mov",
  droneIp: process.env.DRONE_IP || "192.168.0.1",
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
