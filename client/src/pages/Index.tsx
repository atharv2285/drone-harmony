import { useState, useEffect } from "react";
import { Joystick } from "@/components/Joystick";
import { TelemetryDisplay } from "@/components/TelemetryDisplay";
import { VideoDisplay } from "@/components/VideoDisplay";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Link2, ArrowDownUp, SlidersHorizontal, Battery } from "lucide-react";
import { useDroneConnection } from "@/hooks/useDroneConnection";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [droneIp, setDroneIp] = useState(localStorage.getItem('droneIp') || "");
  const [sourceType, setSourceType] = useState(localStorage.getItem('sourceType') || "rtsp");
  // Enable demo stream by default for first-time users
  const [useDemoStream, setUseDemoStream] = useState(
    localStorage.getItem('useDemoStream') === null ? true : localStorage.getItem('useDemoStream') === 'true'
  );

  const { telemetry, isConnecting, connect, disconnect, sendControl } = useDroneConnection(droneIp);

  const [localControl, setLocalControl] = useState({
    thrust: 0,
    yaw: 0,
    roll: 0,
    pitch: 0,
  });

  // Save IPs and sourceType to localStorage
  useEffect(() => {
    if (droneIp) localStorage.setItem('droneIp', droneIp);
  }, [droneIp]);



  useEffect(() => {
    localStorage.setItem('sourceType', sourceType);
  }, [sourceType]);

  useEffect(() => {
    localStorage.setItem('useDemoStream', useDemoStream.toString());
  }, [useDemoStream]);

  // Update telemetry display and send to drone
  useEffect(() => {
    sendControl(localControl);
  }, [localControl, sendControl]);

  const handleLeftJoystick = (x: number, y: number) => {
    setLocalControl((prev) => ({
      ...prev,
      thrust: Math.round(((y + 1) / 2) * 100), // Convert -1 to 1 => 0 to 100
      yaw: Math.round(x * 180), // Convert -1 to 1 => -180 to 180
    }));
  };

  const handleRightJoystick = (x: number, y: number) => {
    setLocalControl((prev) => ({
      ...prev,
      roll: Math.round(x * 45), // Convert -1 to 1 => -45 to 45
      pitch: Math.round(y * 45), // Convert -1 to 1 => -45 to 45
    }));
  };

  const handleConnectionToggle = () => {
    if (telemetry.connected) {
      disconnect();
    } else {
      if (!droneIp) {
        alert("Please configure drone IP in settings first");
        return;
      }
      connect();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <SettingsDialog
          droneIp={droneIp}
          sourceType={sourceType}
          useDemoStream={useDemoStream}
          onDroneIpChange={setDroneIp}
          onSourceTypeChange={setSourceType}
          onUseDemoStreamChange={setUseDemoStream}
        />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center rotate-45">
            <div className="w-8 h-1 bg-background"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lite Wing</h1>
        </div>

        <Button
          onClick={handleConnectionToggle}
          disabled={isConnecting}
          variant="secondary"
          size="icon"
          className="w-14 h-14 rounded-full"
        >
          <Link2 className={`w-6 h-6 ${telemetry.connected ? 'text-accent' : 'text-muted-foreground'}`} />
        </Button>
      </header>

      {/* Telemetry Bar */}
      <div className="flex items-center justify-between px-16 py-8 border-b border-border">
        <div className="flex items-center gap-16">
          <TelemetryDisplay label="THRUST" value={`${localControl.thrust}`} unit="%" />
          <TelemetryDisplay label="YAW" value={`${localControl.yaw}`} unit="°/s" />
        </div>

        <a
          href="#"
          className="text-accent text-sm flex items-center gap-2 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            window.open("https://docs.lovable.dev", "_blank");
          }}
        >
          <Link2 className="w-4 h-4" />
          How to Fly
        </a>

        <div className="flex items-center gap-16">
          <TelemetryDisplay label="ROLL" value={`${localControl.roll}`} unit="°" />
          <TelemetryDisplay label="PITCH" value={`${localControl.pitch}`} unit="°" />
        </div>
      </div>

      {/* Main Control Area */}
      <main className="flex items-center justify-between px-16 py-12 max-w-7xl mx-auto">
        {/* Left Side Controls */}
        <div className="flex flex-col gap-8">
          <button className="w-14 h-14 rounded-full bg-secondary border border-control-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowDownUp className="w-6 h-6 text-muted-foreground" />
          </button>
          <Joystick label="THRUST/YAW" onMove={handleLeftJoystick} />
        </div>

        {/* Center Video Display */}
        <div className="flex flex-col items-center gap-6">
          <VideoDisplay droneIp={droneIp} sourceType={sourceType} useDemoStream={useDemoStream} />

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${telemetry.connected ? 'text-accent' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${telemetry.connected ? 'bg-accent animate-pulse' : 'bg-muted'}`}></div>
              <span className="text-sm">
                {isConnecting ? 'Connecting...' : telemetry.connected ? 'Drone Connected' : 'Drone Disconnected'}
              </span>
            </div>

            <div className="w-px h-4 bg-border"></div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Battery className="w-5 h-5" />
              <span className="text-lg font-mono">
                {telemetry.battery > 0 ? `${telemetry.battery}%` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-col gap-8">
          <button className="w-14 h-14 rounded-full bg-secondary border border-control-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
          </button>
          <Joystick label="ROLL/PITCH" onMove={handleRightJoystick} />
        </div>
      </main>
    </div>
  );
};

export default Index;
