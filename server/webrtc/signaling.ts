import { WebSocket } from "ws";
import type { SignalingMessage } from "../../shared/schema";
import { FFmpegTranscoder, VideoSourceType } from "./transcoder";

export interface WebRTCSession {
  id: string;
  ws: WebSocket;
  transcoder: FFmpegTranscoder | null;
  peerConnection: any;
}

export class SignalingServer {
  private sessions: Map<string, WebRTCSession> = new Map();

  handleConnection(ws: WebSocket, sessionId: string): void {
    console.log(`New WebRTC signaling connection: ${sessionId}`);

    const session: WebRTCSession = {
      id: sessionId,
      ws,
      transcoder: null,
      peerConnection: null,
    };

    this.sessions.set(sessionId, session);

    ws.on("message", async (data: Buffer) => {
      try {
        const message: SignalingMessage = JSON.parse(data.toString());
        await this.handleSignalingMessage(session, message);
      } catch (error) {
        console.error("Error handling signaling message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    ws.on("close", () => {
      this.cleanupSession(sessionId);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error);
      this.cleanupSession(sessionId);
    });
  }

  private async handleSignalingMessage(
    session: WebRTCSession,
    message: SignalingMessage
  ): Promise<void> {
    switch (message.type) {
      case "offer":
        console.log("Received offer from client");
        const answer = await this.createAnswer(session, message.sdp);
        session.ws.send(JSON.stringify({ type: "answer", sdp: answer }));
        break;

      case "ice-candidate":
        console.log("Received ICE candidate from client");
        break;

      default:
        console.warn("Unknown signaling message type");
    }
  }

  private async createAnswer(session: WebRTCSession, offer: string): Promise<string> {
    const answer = `v=0
o=- 0 0 IN IP4 127.0.0.1
s=WebRTC Stream
t=0 0
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:placeholder
a=ice-pwd:placeholder
a=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
a=setup:actpass
a=mid:0
a=sendrecv
a=rtcp-mux
a=rtpmap:96 H264/90000
a=fmtp:96 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f`;

    return answer;
  }

  startStream(sessionId: string, sourceUrl: string, sourceType: VideoSourceType): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    if (session.transcoder) {
      session.transcoder.stop();
    }

    const transcoder = new FFmpegTranscoder({ sourceUrl, sourceType });
    session.transcoder = transcoder;

    transcoder.on("data", (data: Buffer) => {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(data);
      }
    });

    transcoder.on("error", (error: Error) => {
      console.error("Transcoder error:", error);
      session.ws.send(JSON.stringify({ type: "error", message: "Stream error" }));
    });

    transcoder.start();
    console.log(`Started stream for session ${sessionId}`);
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.transcoder) {
        session.transcoder.stop();
      }
      this.sessions.delete(sessionId);
      console.log(`Cleaned up session: ${sessionId}`);
    }
  }
}

export const signalingServer = new SignalingServer();
