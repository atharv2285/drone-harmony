import { useState, useEffect } from "react";
import { Video, VideoOff } from "lucide-react";

interface VideoDisplayProps {
  streamUrl: string;
}

export const VideoDisplay = ({ streamUrl }: VideoDisplayProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [actualStreamUrl, setActualStreamUrl] = useState("");

  useEffect(() => {
    if (streamUrl && isStreaming) {
      // ESP-EYE typically serves MJPEG stream on /stream endpoint
      setActualStreamUrl(`http://${streamUrl}/stream`);
      setStreamError(false);
    }
  }, [streamUrl, isStreaming]);

  const handleImageError = () => {
    setStreamError(true);
    console.error("Failed to load video stream from:", actualStreamUrl);
  };

  const handleImageLoad = () => {
    setStreamError(false);
  };

  const toggleStream = () => {
    if (!streamUrl) {
      alert("Please configure camera IP in settings first");
      return;
    }
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[480px] h-[360px] border-2 border-control-border rounded-lg bg-control-bg overflow-hidden">
        {streamUrl && isStreaming && !streamError ? (
          <img 
            src={actualStreamUrl} 
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
                ESP-EYE Camera Feed
              </div>
              <div className="text-status-text font-medium">
                {!streamUrl ? "Configure camera IP in settings" :
                 streamError ? "Failed to connect to camera" :
                 isStreaming ? "Connecting..." :
                 "Click Start Stream to begin"}
              </div>
              {streamError && streamUrl && (
                <div className="text-xs text-destructive mt-2">
                  Cannot reach: http://{streamUrl}/stream
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

        {/* Resolution indicator */}
        {isStreaming && !streamError && (
          <div className="absolute top-3 right-3 bg-black/50 px-3 py-1.5 rounded">
            <span className="text-xs text-white font-mono">640x480</span>
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
