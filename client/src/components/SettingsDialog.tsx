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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";

interface SettingsDialogProps {
  droneIp: string;
  sourceType: string;
  useDemoStream: boolean;
  onDroneIpChange: (ip: string) => void;
  onSourceTypeChange: (type: string) => void;
  onUseDemoStreamChange: (use: boolean) => void;
}

export const SettingsDialog = ({
  droneIp,
  sourceType,
  useDemoStream,
  onDroneIpChange,
  onSourceTypeChange,
  onUseDemoStreamChange,
}: SettingsDialogProps) => {
  const [localDroneIp, setLocalDroneIp] = useState(droneIp);
  const [localSourceType, setLocalSourceType] = useState(sourceType);
  const [localUseDemoStream, setLocalUseDemoStream] = useState(useDemoStream);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onDroneIpChange(localDroneIp);
    onSourceTypeChange(localSourceType);
    onUseDemoStreamChange(localUseDemoStream);
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
            Configure your drone IP address and video stream settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-md">
            <Checkbox
              id="demo-stream"
              checked={localUseDemoStream}
              onCheckedChange={(checked) => setLocalUseDemoStream(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="demo-stream" className="text-sm font-medium cursor-pointer">
                Use Demo Stream
              </Label>
              <p className="text-xs text-muted-foreground">
                Test with a public RTSP stream (Big Buck Bunny)
              </p>
            </div>
          </div>

          {!localUseDemoStream && (
            <>
              <div className="space-y-2">
                <Label htmlFor="drone-ip">Drone IP Address</Label>
                <Input
                  id="drone-ip"
                  placeholder="192.168.4.1"
                  value={localDroneIp}
                  onChange={(e) => setLocalDroneIp(e.target.value)}
                  className="bg-control-bg border-control-border"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the IP address of your drone
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-type">Video Stream Type</Label>
                <Select value={localSourceType} onValueChange={setLocalSourceType}>
                  <SelectTrigger id="source-type" className="bg-control-bg border-control-border">
                    <SelectValue placeholder="Select stream type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rtsp">RTSP (Default)</SelectItem>
                    <SelectItem value="mjpeg">MJPEG</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="direct">Direct HTTP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {localSourceType === 'rtsp' && `Stream URL: rtsp://${localDroneIp || 'IP'}/live`}
                  {localSourceType === 'mjpeg' && `Stream URL: http://${localDroneIp || 'IP'}:8080/video`}
                  {localSourceType === 'udp' && `Stream URL: udp://${localDroneIp || 'IP'}:11111`}
                  {localSourceType === 'direct' && `Stream URL: http://${localDroneIp || 'IP'}/`}
                </p>
              </div>
            </>
          )}

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
