import { LucideIcon } from "lucide-react";

interface ControlButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
}

export const ControlButton = ({ icon: Icon, onClick }: ControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full bg-secondary border border-control-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
    >
      <Icon className="w-6 h-6 text-muted-foreground" />
    </button>
  );
};
