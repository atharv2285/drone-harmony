import { useState, useEffect } from "react";
import { Video, VideoOff } from "lucide-react";

interface VideoDisplayProps {
  droneIp: string;
  sourceType: string;
  useDemoStream: boolean;
}

export const VideoDisplay = ({ droneIp, sourceType, useDemoStream }: VideoDisplayProps) => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  // Refresh stream when settings change
  useEffect(() => {
    setStreamKey(prev => prev + 1);
    setStreamError(false);
  }, [droneIp, sourceType, useDemoStream]);

  const handleImageError = () => {
    setStreamError(true);
    console.error("Failed to load video stream");
  };

  const handleImageLoad = () => {
    setStreamError(false);
    console.log("Video stream loaded successfully");
  };

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    setStreamError(false);
    setStreamKey(prev => prev + 1);
  };

  // Construct backend stream URL
  const backendStreamUrl = useDemoStream
    ? `/api/stream?demo=true&_=${streamKey}`
    : droneIp
      ? `/api/stream?droneIp=${encodeURIComponent(droneIp)}&sourceType=${sourceType}&_=${streamKey}`
      : `/api/stream?test=true&_=${streamKey}`;

  const streamLabel = useDemoStream
    ? "Demo Stream (Big Buck Bunny)"
    : droneIp
      ? `Drone Feed (${sourceType.toUpperCase()})`
      : "Test Pattern";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[480px] h-[360px] border-2 border-control-border rounded-lg bg-control-bg overflow-hidden">
        {isStreaming && !streamError ? (
          <img
            key={streamKey}
            src={backendStreamUrl}
            alt="Drone camera feed"
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <VideoOff className="w-16 h-16 text-muted-foreground" />
            <div className="text-center px-4">
              <div className="text-xs text-muted-foreground mb-2">
                {streamLabel}
              </div>
              <div className="text-status-text font-medium">
                {streamError ? "Failed to connect to stream" :
                  isStreaming ? "Connecting..." :
                    "Click Start Stream to begin"}
              </div>
              {streamError && (
                <div className="text-xs text-destructive mt-2">
                  {useDemoStream
                    ? "Cannot load demo stream. Check backend connection."
                    : droneIp
                      ? `Cannot connect to drone at ${droneIp}. Check IP and stream type.`
                      : "Cannot load test stream. Check backend logs."}
                </div>
              )}
              {!droneIp && !useDemoStream && !streamError && (
                <div className="text-xs text-muted-foreground mt-2">
                  Configure drone IP in settings or enable demo stream
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video overlay indicators */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded">
          <div className={`w-2 h-2 rounded-full ${isStreaming && !streamError ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-white font-mono">
            {isStreaming && !streamError ? 'LIVE' : 'NO SIGNAL'}
          </span>
        </div>

        {/* Stream type indicator */}
        {isStreaming && !streamError && (
          <div className="absolute top-3 right-3 bg-black/50 px-3 py-1.5 rounded">
            <span className="text-xs text-white font-mono uppercase">
              {useDemoStream ? "DEMO" : droneIp ? sourceType : "TEST"}
            </span>
          </div>
        )}
      </div>

      {/* Stream controls */}
      <button
        onClick={toggleStream}
        className="flex items-center gap-2 px-4 py-2 bg-secondary border border-control-border rounded-md hover:bg-secondary/80 transition-colors"
      >
        {isStreaming ? (
          <>
            <VideoOff className="w-4 h-4" />
            <span className="text-sm">Stop Stream</span>
          </>
        ) : (
          <>
            <Video className="w-4 h-4" />
            <span className="text-sm">Start Stream</span>
          </>
        )}
      </button>
    </div>
  );
};
