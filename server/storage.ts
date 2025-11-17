import type { DroneControl, DroneTelemetry } from "../shared/schema";

export interface IStorage {
  getTelemetry(): Promise<DroneTelemetry>;
  updateTelemetry(telemetry: Partial<DroneTelemetry>): Promise<void>;
  getControl(): Promise<DroneControl>;
  updateControl(control: DroneControl): Promise<void>;
}

export class MemStorage implements IStorage {
  private telemetry: DroneTelemetry = {
    thrust: 0,
    yaw: 0,
    roll: 0,
    pitch: 0,
    battery: 0,
    connected: false,
  };

  private control: DroneControl = {
    thrust: 0,
    yaw: 0,
    roll: 0,
    pitch: 0,
  };

  async getTelemetry(): Promise<DroneTelemetry> {
    return { ...this.telemetry };
  }

  async updateTelemetry(update: Partial<DroneTelemetry>): Promise<void> {
    this.telemetry = { ...this.telemetry, ...update };
  }

  async getControl(): Promise<DroneControl> {
    return { ...this.control };
  }

  async updateControl(control: DroneControl): Promise<void> {
    this.control = control;
  }
}

export const storage = new MemStorage();
