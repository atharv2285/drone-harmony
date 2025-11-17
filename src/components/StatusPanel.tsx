import { Link2 } from "lucide-react";

interface StatusPanelProps {
  connected: boolean;
  message: string;
}

export const StatusPanel = ({ connected, message }: StatusPanelProps) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-status-text">
        <Link2 className={`w-4 h-4 ${connected ? 'text-accent' : 'text-muted-foreground'}`} />
        <span className="text-sm">
          {connected ? 'Connected to Drone' : 'Not Connected to Drone'}
        </span>
      </div>

      <div className="border border-control-border rounded-lg px-8 py-6 bg-control-bg min-w-[280px]">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-2">
            LiteWing by CircuitDigest
          </div>
          <div className="text-status-text font-medium">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};
