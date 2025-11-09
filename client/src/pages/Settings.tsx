import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Database } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings?userId=default");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
  
  const [localOnlyProcessing, setLocalOnlyProcessing] = useState(true);
  const [dataLogging, setDataLogging] = useState(true);
  
  useEffect(() => {
    if (settings) {
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
  
  const handleLocalProcessingToggle = (checked: boolean) => {
    setLocalOnlyProcessing(checked);
    updateSettingsMutation.mutate({ localOnlyProcessing: checked });
  };
  
  const handleDataLoggingToggle = (checked: boolean) => {
    setDataLogging(checked);
    updateSettingsMutation.mutate({ dataLogging: checked });
  };
  
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden transition-colors",
        isDark ? "bg-[#0f1424] text-slate-100" : "bg-[#f3edff] text-slate-900"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-40 -left-60 h-[480px] w-[520px] rounded-full opacity-50 blur-[200px]",
          isDark ? "bg-[#222f5c]" : "bg-[#c4d2ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[-200px] right-[-180px] h-[520px] w-[520px] rounded-full opacity-40 blur-[220px]",
          isDark ? "bg-[#123b46]" : "bg-[#8df5ff]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-slate-900 dark:text-slate-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100">Privacy & Settings</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Tailor how MoodFlow handles your data and on-device processing.
          </p>
        </div>
        <div className="space-y-6">
          <Card className="rounded-3xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:bg-slate-900/70">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#7d5bff]/15 text-[#7d5bff] dark:bg-[#7d5bff]/30">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="local-processing" className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Local-Only Processing
                  </Label>
                  <Switch
                    id="local-processing"
                    checked={localOnlyProcessing}
                    onCheckedChange={handleLocalProcessingToggle}
                    data-testid="switch-local-processing"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Process all mood detection and analysis on your device without sending data to external servers. This provides maximum privacy but may reduce accuracy.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-3xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:bg-slate-900/70">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#25c2a0]/15 text-[#25c2a0] dark:bg-[#25c2a0]/25">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="data-logging" className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Data Logging
                  </Label>
                  <Switch
                    id="data-logging"
                    checked={dataLogging}
                    onCheckedChange={handleDataLoggingToggle}
                    data-testid="switch-data-logging"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Save your mood history and preferences to improve recommendations over time. You can opt out at any time and your data will be deleted.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="rounded-3xl border-0 bg-white/70 p-6 shadow-inner backdrop-blur-xl dark:bg-slate-900/60">
            <h3 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-200">Privacy Notice</h3>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-300">
              <p>• Your mood data is stored locally on your device</p>
              <p>• Text analysis is processed securely and privately</p>
              <p>• You can delete all your data at any time from settings</p>
              <p>• We don't share your personal information with third parties</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}