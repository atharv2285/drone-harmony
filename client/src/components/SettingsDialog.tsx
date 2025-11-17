import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SettingsDialogProps {
  droneIp: string;
  cameraIp: string;
  onDroneIpChange: (ip: string) => void;
  onCameraIpChange: (ip: string) => void;
}

export const SettingsDialog = ({
  droneIp,
  cameraIp,
  onDroneIpChange,
  onCameraIpChange,
}: SettingsDialogProps) => {
  const [localDroneIp, setLocalDroneIp] = useState(droneIp);
  const [localCameraIp, setLocalCameraIp] = useState(cameraIp);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onDroneIpChange(localDroneIp);
    onCameraIpChange(localCameraIp);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-14 h-14 rounded-full bg-secondary border border-control-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-control-border">
        <DialogHeader>
          <DialogTitle>Drone Settings</DialogTitle>
          <DialogDescription>
            Configure your drone and camera IP addresses
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="drone-ip">Drone Controller IP</Label>
            <Input
              id="drone-ip"
              placeholder="192.168.4.1"
              value={localDroneIp}
              onChange={(e) => setLocalDroneIp(e.target.value)}
              className="bg-control-bg border-control-border"
            />
            <p className="text-xs text-muted-foreground">
              WebSocket endpoint: ws://{localDroneIp || 'IP'}/ws
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="camera-ip">ESP-EYE Camera IP</Label>
            <Input
              id="camera-ip"
              placeholder="192.168.4.2"
              value={localCameraIp}
              onChange={(e) => setLocalCameraIp(e.target.value)}
              className="bg-control-bg border-control-border"
            />
            <p className="text-xs text-muted-foreground">
              Stream URL: http://{localCameraIp || 'IP'}/stream
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
