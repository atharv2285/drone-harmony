interface TelemetryDisplayProps {
  label: string;
  value: string;
  unit?: string;
}

export const TelemetryDisplay = ({ label, value, unit }: TelemetryDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-medium tracking-wider text-telemetry-text">
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value}
        {unit && <span className="text-sm ml-0.5">{unit}</span>}
      </div>
    </div>
  );
};
