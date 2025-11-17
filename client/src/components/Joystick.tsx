import { useEffect, useRef, useState } from "react";

interface JoystickProps {
  label: string;
  onMove: (x: number, y: number) => void;
}

export const Joystick = ({ label, onMove }: JoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!joystickRef.current || !isDragging) return;

      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      // Limit to circle radius (80px max movement)
      const maxRadius = 80;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > maxRadius) {
        deltaX = (deltaX / distance) * maxRadius;
        deltaY = (deltaY / distance) * maxRadius;
      }

      setPosition({ x: deltaX, y: deltaY });
      
      // Convert to -1 to 1 range
      const normalizedX = deltaX / maxRadius;
      const normalizedY = -deltaY / maxRadius; // Invert Y axis
      
      onMove(normalizedX, normalizedY);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onMove(0, 0);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, onMove]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-64 h-64">
        {/* Outer circles */}
        <div className="absolute inset-0 rounded-full border border-control-border"></div>
        <div className="absolute inset-8 rounded-full border border-control-border"></div>
        <div className="absolute inset-16 rounded-full border border-control-border"></div>
        
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-control-border"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-control-border"></div>
        </div>

        {/* Joystick knob */}
        <div
          ref={joystickRef}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div
            className="w-24 h-24 rounded-full bg-secondary border-2 border-muted transition-all duration-100 hover:bg-secondary/80"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          ></div>
        </div>
      </div>
      
      <div className="text-sm font-semibold tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
};
