import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Camera } from "lucide-react";

interface MoodDetectionModalProps {
  open: boolean;
  onClose: () => void;
  onDetect: (text: string, useWebcam: boolean) => void;
  webcamConsent: boolean;
  onWebcamConsentChange: (consent: boolean) => void;
}

export default function MoodDetectionModal({
  open,
  onClose,
  onDetect,
  webcamConsent,
  onWebcamConsentChange
}: MoodDetectionModalProps) {
  const [text, setText] = useState("");
  const [useWebcam, setUseWebcam] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const handleDetect = async () => {
    setIsDetecting(true);
    setTimeout(() => {
      onDetect(text, useWebcam && webcamConsent);
      setIsDetecting(false);
      setText("");
      setUseWebcam(false);
      onClose();
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-mood-detection">
        <DialogHeader>
          <DialogTitle>Check Your Mood</DialogTitle>
          <DialogDescription>
            Tell us how you're feeling, and we'll adapt your planner accordingly
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="mood-text" className="mb-2 block">
              How are you feeling today?
            </Label>
            <Textarea
              id="mood-text"
              placeholder="I'm feeling calm and focused today..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              data-testid="textarea-mood-input"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="webcam-toggle" className="font-medium">
                  Use Webcam Analysis
                </Label>
                <p className="text-xs text-muted-foreground">
                  {webcamConsent ? "Analyze facial expressions" : "Enable in settings first"}
                </p>
              </div>
            </div>
            <Switch
              id="webcam-toggle"
              checked={useWebcam}
              onCheckedChange={setUseWebcam}
              disabled={!webcamConsent}
              data-testid="switch-webcam"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDetect}
            disabled={!text.trim() || isDetecting}
            className="flex-1"
            data-testid="button-detect-mood"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Detect Mood"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
