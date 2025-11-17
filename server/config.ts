import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  droneVideoSource: process.env.DRONE_VIDEO_SOURCE || "test",
  droneIp: process.env.DRONE_IP || "192.168.0.1",
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
