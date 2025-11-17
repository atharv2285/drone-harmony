import { WebSocket } from "ws";
import { droneControlSchema, type DroneControl, type DroneTelemetry } from "../../shared/schema";
import { storage } from "../storage";

export interface ControlSession {
  id: string;
  ws: WebSocket;
  droneWs: WebSocket | null;
  droneIp: string;
}

export class DroneControlProxy {
  private sessions: Map<string, ControlSession> = new Map();

  handleConnection(ws: WebSocket, sessionId: string): void {
    console.log(`New drone control connection: ${sessionId}`);

    const session: ControlSession = {
      id: sessionId,
      ws,
      droneWs: null,
      droneIp: "",
    };

    this.sessions.set(sessionId, session);

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleControlMessage(session, message);
      } catch (error) {
        console.error("Error handling control message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    ws.on("close", () => {
      this.cleanupSession(sessionId);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for control session ${sessionId}:`, error);
      this.cleanupSession(sessionId);
    });
  }

  private async handleControlMessage(session: ControlSession, message: any): Promise<void> {
    switch (message.type) {
      case "connect":
        if (message.droneIp) {
          await this.connectToDrone(session, message.droneIp);
        }
        break;

      case "disconnect":
        this.disconnectFromDrone(session);
        break;

      case "control":
        const validation = droneControlSchema.safeParse(message.data);
        if (validation.success) {
          await this.sendControlToDrone(session, validation.data);
        } else {
          console.error("Invalid control data:", validation.error);
        }
        break;

      default:
        console.warn("Unknown control message type:", message.type);
    }
  }

  private async connectToDrone(session: ControlSession, droneIp: string): Promise<void> {
    if (session.droneWs) {
      session.droneWs.close();
    }

    session.droneIp = droneIp;

    try {
      const droneWs = new WebSocket(`ws://${droneIp}/ws`);
      session.droneWs = droneWs;

      droneWs.on("open", () => {
        console.log(`Connected to drone at ${droneIp}`);
        storage.updateTelemetry({ connected: true });
        session.ws.send(JSON.stringify({
          type: "connected",
          message: "Connected to drone",
        }));
      });

      droneWs.on("message", (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "telemetry") {
            storage.updateTelemetry(message.data);
            session.ws.send(data.toString());
          }
        } catch (error) {
          console.error("Error parsing drone message:", error);
        }
      });

      droneWs.on("error", (error) => {
        console.error(`Drone WebSocket error:`, error);
        storage.updateTelemetry({ connected: false });
        session.ws.send(JSON.stringify({
          type: "error",
          message: "Drone connection error",
        }));
      });

      droneWs.on("close", () => {
        console.log("Disconnected from drone");
        storage.updateTelemetry({ connected: false });
        session.droneWs = null;
        session.ws.send(JSON.stringify({
          type: "disconnected",
          message: "Disconnected from drone",
        }));
      });
    } catch (error) {
      console.error("Failed to connect to drone:", error);
      session.ws.send(JSON.stringify({
        type: "error",
        message: "Failed to connect to drone",
      }));
    }
  }

  private disconnectFromDrone(session: ControlSession): void {
    if (session.droneWs) {
      session.droneWs.close();
      session.droneWs = null;
    }
    storage.updateTelemetry({ connected: false });
  }

  private async sendControlToDrone(session: ControlSession, control: DroneControl): Promise<void> {
    await storage.updateControl(control);

    if (session.droneWs && session.droneWs.readyState === WebSocket.OPEN) {
      session.droneWs.send(JSON.stringify({
        type: "control",
        data: control,
      }));
    }
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.disconnectFromDrone(session);
      this.sessions.delete(sessionId);
      console.log(`Cleaned up control session: ${sessionId}`);
    }
  }
}

export const droneControlProxy = new DroneControlProxy();
