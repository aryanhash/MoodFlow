import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  onStreamFrame?: (imageData: string) => void; // optional live detection callback
  autoLive?: boolean; // start streaming immediately when camera starts
  statusText?: string; // UI hint like current mood/confidence
}

export default function CameraCapture({ onCapture, onClose, onStreamFrame, autoLive = false, statusText }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const liveTimerRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (liveTimerRef.current) {
        window.clearInterval(liveTimerRef.current);
        liveTimerRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
      // If autoLive requested and streaming callback is provided, start interval
      if (onStreamFrame && autoLive && !liveTimerRef.current) {
        toggleLive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    
    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    onCapture(imageData);
    setIsCapturing(false);
  };

  // Start/stop live streaming frames every 1500ms (throttled)
  const toggleLive = (forceOn?: boolean) => {
    if (!onStreamFrame) return;
    if (!forceOn && liveTimerRef.current) {
      window.clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
      return;
    }
    liveTimerRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const now = Date.now();
      if (now - lastSentRef.current < 1400) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      lastSentRef.current = now;
      onStreamFrame(imageData);
    }, 1500);
  };

  const retakePhoto = () => {
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Capture Your Expression</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {onStreamFrame && (
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-green-600 text-white shadow">
                    Live
                  </div>
                )}
                {statusText && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded-md bg-black/60 text-white">
                    {statusText}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isCapturing ? "Capturing..." : "Capture"}
                </Button>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  disabled={isCapturing}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {onStreamFrame && !autoLive && (
                  <Button
                    onClick={() => toggleLive()}
                    variant="outline"
                    disabled={isCapturing}
                  >
                    Live Detect
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Look at the camera and capture your current expression
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
