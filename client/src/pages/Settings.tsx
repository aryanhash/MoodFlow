import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Shield, Database } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showWebcamDialog, setShowWebcamDialog] = useState(false);
  
  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings?userId=default");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
  
  const [webcamConsent, setWebcamConsent] = useState(false);
  const [localOnlyProcessing, setLocalOnlyProcessing] = useState(true);
  const [dataLogging, setDataLogging] = useState(true);
  
  useEffect(() => {
    if (settings) {
      setWebcamConsent(settings.webcamConsent);
      setLocalOnlyProcessing(settings.localOnlyProcessing);
      setDataLogging(settings.dataLogging);
    }
  }, [settings]);
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest("PATCH", "/api/settings", { userId: "default", ...updates });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
  
  const handleWebcamToggle = (checked: boolean) => {
    if (checked) {
      setShowWebcamDialog(true);
    } else {
      setWebcamConsent(false);
      updateSettingsMutation.mutate({ webcamConsent: false });
    }
  };
  
  const handleWebcamConsent = () => {
    setWebcamConsent(true);
    setShowWebcamDialog(false);
    updateSettingsMutation.mutate({ webcamConsent: true });
  };
  
  const handleLocalProcessingToggle = (checked: boolean) => {
    setLocalOnlyProcessing(checked);
    updateSettingsMutation.mutate({ localOnlyProcessing: checked });
  };
  
  const handleDataLoggingToggle = (checked: boolean) => {
    setDataLogging(checked);
    updateSettingsMutation.mutate({ dataLogging: checked });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-accent font-semibold">Privacy & Settings</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="webcam-consent" className="text-base font-semibold">
                    Webcam Access
                  </Label>
                  <Switch
                    id="webcam-consent"
                    checked={webcamConsent}
                    onCheckedChange={handleWebcamToggle}
                    data-testid="switch-webcam-consent"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow the app to access your webcam for facial mood analysis. Your privacy is important - all processing happens locally on your device.
                </p>
                {webcamConsent && (
                  <div className="mt-3 p-3 rounded-lg bg-green-100 dark:bg-green-950/30">
                    <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                      ✓ Webcam access enabled
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="local-processing" className="text-base font-semibold">
                    Local-Only Processing
                  </Label>
                  <Switch
                    id="local-processing"
                    checked={localOnlyProcessing}
                    onCheckedChange={handleLocalProcessingToggle}
                    data-testid="switch-local-processing"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Process all mood detection and analysis on your device without sending data to external servers. This provides maximum privacy but may reduce accuracy.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="data-logging" className="text-base font-semibold">
                    Data Logging
                  </Label>
                  <Switch
                    id="data-logging"
                    checked={dataLogging}
                    onCheckedChange={handleDataLoggingToggle}
                    data-testid="switch-data-logging"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Save your mood history and preferences to improve recommendations over time. You can opt out at any time and your data will be deleted.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">Privacy Notice</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Your mood data is stored locally on your device</p>
              <p>• Webcam images are processed in real-time and never saved</p>
              <p>• You can delete all your data at any time from settings</p>
              <p>• We don't share your personal information with third parties</p>
            </div>
          </Card>
        </div>
      </main>
      
      <AlertDialog open={showWebcamDialog} onOpenChange={setShowWebcamDialog}>
        <AlertDialogContent data-testid="dialog-webcam-consent">
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Webcam Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This app would like to access your webcam to analyze facial expressions for mood detection.
              All processing happens locally on your device. Your images are never stored or transmitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-webcam-decline">
              Decline
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleWebcamConsent} data-testid="button-webcam-accept">
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
