import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Mic, MicOff } from "lucide-react";
import { getLanguageName } from "@/lib/language";
import { useTranslation } from "@/hooks/useTranslation";
import { lingoClient } from "@/lib/lingoClient";

interface MoodDetectionModalProps {
  open: boolean;
  onClose: () => void;
  onDetect: (text: string) => void;
}

export default function MoodDetectionModal({
  open,
  onClose,
  onDetect
}: MoodDetectionModalProps) {
  const { t } = useTranslation();
  const [isDetecting, setIsDetecting] = useState(false);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const cleanupStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRecorderStop = async () => {
    cleanupStream();
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];
    if (audioBlob.size === 0) return;
    setIsTranscribing(true);
    setErrorMessage(null);
    try {
      const result = await lingoClient.speechToText({ audio: audioBlob, language: "auto" });
      setText(result.text);
      setDetectedLanguage(result.detectedLanguage ?? null);
    } catch (error) {
      console.error("Speech-to-text error", error);
      setErrorMessage(t("moodModal.transcriptionError", "Unable to transcribe voice input. Please try again."));
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(t("moodModal.microphoneDenied", "Voice recording is not supported in this browser."));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = handleRecorderStop;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      setErrorMessage("Microphone access was denied. Please allow microphone usage to record voice.");
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    if (!open) {
      stopRecording();
      cleanupStream();
      setDetectedLanguage(null);
      setErrorMessage(null);
      setIsTranscribing(false);
    }
    return () => {
      stopRecording();
      cleanupStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDetect = async () => {
    if (!text.trim()) {
      alert(t("moodModal.prompt", "How are you feeling today?"));
      return;
    }
    setIsDetecting(true);
    try {
      onDetect(text);
    } finally {
      setIsDetecting(false);
      setText("");
      setDetectedLanguage(null);
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-mood-detection">
        <DialogHeader>
          <DialogTitle>{t("moodModal.title", "Check Your Mood")}</DialogTitle>
          <DialogDescription>
            {t("moodModal.description", "Tell us how you're feeling, and we'll adapt your planner accordingly.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="mood-text" className="text-sm font-medium">
              {t("moodModal.prompt", "How are you feeling today?")}
            </label>
            <Textarea
              id="mood-text"
              placeholder={t("moodModal.placeholder", "I'm feeling happy and energized today...")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              {detectedLanguage && (
                <span>
                  {t("moodModal.detectedLanguage", "Detected language")}: {getLanguageName(detectedLanguage)}
                </span>
              )}
              {isTranscribing && (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("moodModal.listening", "Processing voice input...")}
                </span>
              )}
            </div>
            <div className="flex items-center justify-end">
              <Button
                variant={isRecording ? "destructive" : "secondary"}
                onClick={handleToggleRecording}
                disabled={isTranscribing}
                type="button"
                className="flex items-center gap-2"
                aria-pressed={isRecording}
                aria-live="polite"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? t("moodModal.stopRecording", "Stop Listening") : t("moodModal.record", "Record Voice")}
              </Button>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t("moodModal.cancel", "Cancel")}
            </Button>
            <Button 
              onClick={handleDetect} 
              disabled={isDetecting || !text.trim()}
              className="min-w-[120px]"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("moodModal.analyzing", "Analyzing...")}
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("moodModal.detect", "Detect Mood")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
