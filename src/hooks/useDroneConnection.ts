import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface DroneControl {
  thrust: number;
  yaw: number;
  roll: number;
  pitch: number;
}

interface DroneTelemetry {
  thrust: number;
  yaw: number;
  roll: number;
  pitch: number;
  battery: number;
  connected: boolean;
}

export const useDroneConnection = (droneIp: string) => {
  const [telemetry, setTelemetry] = useState<DroneTelemetry>({
    thrust: 0,
    yaw: 0,
    roll: 0,
    pitch: 0,
    battery: 0,
    connected: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const controlIntervalRef = useRef<NodeJS.Timeout>();
  const currentControlRef = useRef<DroneControl>({
    thrust: 0,
    yaw: 0,
    roll: 0,
    pitch: 0,
  });

  const connect = useCallback(() => {
    if (!droneIp || isConnecting) return;

    setIsConnecting(true);
    console.log(`Attempting to connect to drone at ${droneIp}...`);

    try {
      // WebSocket connection to drone (adjust protocol based on your ESP setup)
      const ws = new WebSocket(`ws://${droneIp}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to drone!");
        setTelemetry(prev => ({ ...prev, connected: true }));
        setIsConnecting(false);
        toast.success("Connected to drone");

        // Start sending control commands at 50Hz (20ms interval)
        controlIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'control',
              data: currentControlRef.current
            }));
          }
        }, 20);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'telemetry') {
            setTelemetry(prev => ({
              ...prev,
              ...data.data,
              connected: true,
            }));
          }
        } catch (error) {
          console.error("Error parsing telemetry data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Connection error");
      };

      ws.onclose = () => {
        console.log("Disconnected from drone");
        setTelemetry(prev => ({ ...prev, connected: false }));
        setIsConnecting(false);
        
        if (controlIntervalRef.current) {
          clearInterval(controlIntervalRef.current);
        }

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
      toast.error("Failed to connect to drone");
    }
  }, [droneIp, isConnecting]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (controlIntervalRef.current) {
      clearInterval(controlIntervalRef.current);
    }
    setTelemetry(prev => ({ ...prev, connected: false }));
  }, []);

  const sendControl = useCallback((control: DroneControl) => {
    currentControlRef.current = control;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    telemetry,
    isConnecting,
    connect,
    disconnect,
    sendControl,
  };
};
