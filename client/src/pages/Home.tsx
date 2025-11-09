import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import TaskCard from "@/components/TaskCard";
import MoodDetectionModal from "@/components/MoodDetectionModal";
import ShareProgressModal from "@/components/ShareProgressModal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MoodType, DifficultyType, Task, CrisisSummary, HelplineInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, CheckCircle, Camera, Mic, Hand, Sparkles, TrendingUp, Coffee, Share2 } from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import ChatbotWidget from "@/components/ChatbotWidget";
import PeerSupportDrawer from "@/components/PeerSupportDrawer";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageName } from "@/lib/language";
import { useTranslation } from "@/hooks/useTranslation";
import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/use-toast";

type MoodEntryRecord = {
  id: string;
  userId: string;
  mood: MoodType;
  confidence: number;
  textInput?: string | null;
  originalText?: string | null;
  originalLanguage?: string | null;
  translatedText?: string | null;
  translatedLanguage?: string | null;
  translationProvider?: string | null;
  faceAnalysis?: string | null;
  timestamp: string;
  crisisFlag?: boolean | null;
  crisisKeywords?: string[] | null;
  crisisReasons?: string[] | null;
  negativeMoodStreak?: number | null;
  helplineCode?: string | null;
  helplineName?: string | null;
  helplinePhone?: string | null;
  helplineUrl?: string | null;
  helplineLanguage?: string | null;
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const [mood, setMood] = useState<MoodType>("neutral");
  const [confidence, setConfidence] = useState(0);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(1); // Daily streak counter
  const [moodText, setMoodText] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [liveStatus, setLiveStatus] = useState("");
  const [altTasks, setAltTasks] = useState<Task[]>([]);
  const [localizedMessage, setLocalizedMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { vibrate } = useHaptics();
  const { toast } = useToast();
  const [crisisSummary, setCrisisSummary] = useState<CrisisSummary | null>(null);
  const [showPeerSupport, setShowPeerSupport] = useState(false);

  const peerExperiences = useMemo(() => crisisSummary?.reasons ?? [], [crisisSummary]);

  const relativeTimeFormatter = useMemo(() => {
    try {
      return new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    } catch {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    }
  }, [language]);

  const normalizeCrisisSummary = useCallback((summary: CrisisSummary | null): CrisisSummary | null => {
    if (!summary) return null;
    return {
      triggered: summary.triggered,
      reasons: summary.reasons ?? [],
      keywords: summary.keywords ?? [],
      negativeMoodStreak: summary.negativeMoodStreak ?? 0,
      helpline: summary.helpline ?? undefined,
    };
  }, []);

  const buildCrisisSummaryFromEntry = useCallback((entry: MoodEntryRecord | null): CrisisSummary | null => {
    if (!entry || !entry.crisisFlag) {
      return null;
    }
    const helpline: HelplineInfo | null = entry.helplineName
      ? {
          code: entry.helplineCode ?? "INTL",
          name: entry.helplineName ?? "",
          phone: entry.helplinePhone ?? "",
          url: entry.helplineUrl ?? undefined,
          language: entry.helplineLanguage ?? undefined,
        }
      : null;
    return normalizeCrisisSummary({
      triggered: true,
      reasons: entry.crisisReasons ?? [],
      keywords: entry.crisisKeywords ?? [],
      negativeMoodStreak: entry.negativeMoodStreak ?? 0,
      helpline,
    });
  }, [normalizeCrisisSummary]);

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);
  
  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings?userId=default");
      return res.json();
    },
  });
  
  // Fetch latest mood
  const { data: latestMood } = useQuery<MoodEntryRecord | null>({
    queryKey: ["/api/mood/latest"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/mood/latest?userId=default");
      if (res.status === 404) return null;
      return res.json();
    },
  });
  
  // Update local state when latest mood changes
  useEffect(() => {
    if (latestMood) {
      setMood(latestMood.mood);
      setConfidence(latestMood.confidence);
      setLocalizedMessage(null);
      setCrisisSummary(buildCrisisSummaryFromEntry(latestMood));
    }
  }, [latestMood, buildCrisisSummaryFromEntry]);
  
  // Fetch tasks based on mood
  const { data: tasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks", mood],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/tasks?mood=${mood}`);
      return res.json();
    },
    enabled: !!mood,
  });

  // Client-side fallback to all tasks if none returned for mood
  useEffect(() => {
    const loadFallback = async () => {
      try {
        const res = await apiRequest("GET", `/api/tasks`);
        if (res.status >= 200 && res.status < 300) {
          const all = await res.json();
          setAltTasks(all);
        }
      } catch {}
    };
    if (tasks.length === 0) {
      loadFallback();
    } else {
      setAltTasks([]);
    }
  }, [tasks]);
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  // Mood detection mutation
  const detectMoodMutation = useMutation({
    mutationFn: async ({ text, useWebcam, imageData }: { text: string; useWebcam: boolean; imageData?: string }) => {
      const res = await apiRequest("POST", "/api/mood/detect", {
        text,
        useWebcam,
        userId: "default",
        imageData,
        preferredLanguage: language,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMood(data.mood);
      setConfidence(data.confidence);
      const fallbackStatus = t("home.moodStatus", "Mood: {mood} ({confidence}% confidence)")
        .replace("{mood}", data.mood)
        .replace("{confidence}", String(data.confidence));
      setLiveStatus(data.localizedMessage ?? fallbackStatus);
      setLocalizedMessage(data.localizedMessage ?? null);
      setCrisisSummary(normalizeCrisisSummary(data.crisis ?? null));
      if (data.mood === "stressed") {
        vibrate("warning");
      } else if (data.mood === "calm" || data.mood === "energized") {
        vibrate("success");
      }
      setStreak(prev => prev + 1); // Increment streak on successful mood detection
      queryClient.invalidateQueries({ queryKey: ["/api/mood/latest"] });
      // Ensure tasks refresh immediately
      refetchTasks();
      setMoodText("");
    },
    onError: () => {
      setLiveStatus(t("home.analysisFailed", "Unable to analyze mood. Please try again."));
      setLocalizedMessage(null);
      setCrisisSummary(buildCrisisSummaryFromEntry(latestMood ?? null));
    },
  });
  
  // Task completion mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
      return res.json();
    },
  });
  
  const handleMoodDetection = (text: string) => {
    setMoodText(text);
    setLocalizedMessage(null);
    setLiveStatus(t("home.processing", "Processing..."));
    detectMoodMutation.mutate({ text, useWebcam: false }); // Always text-only
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      // Send both the current text input and the image for fused analysis
      setLiveStatus(t("home.processing", "Processing..."));
      setLocalizedMessage(null);
      detectMoodMutation.mutate({ text: moodText, useWebcam: true, imageData });
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageData: string) => {
    // Send both text and captured image for fused analysis
    setLiveStatus(t("home.processing", "Processing..."));
    setLocalizedMessage(null);
    detectMoodMutation.mutate({ text: moodText, useWebcam: true, imageData });
    setShowCamera(false);
  };

  // Throttled live frame handler
  const handleLiveFrame = (imageData: string) => {
    // Avoid flooding: if a previous mutation is in-flight, skip
    if ((detectMoodMutation as any).isPending) return;
    setLiveStatus(t("home.processing", "Processing..."));
    setLocalizedMessage(null);
    detectMoodMutation.mutate({ text: moodText, useWebcam: true, imageData });
  };
  
  const handleRegenerate = () => {
    refetchTasks();
  };

  const handlePlayAudio = async () => {
    if (!latestMood) return;
    setIsPlayingAudio(true);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const textToSpeak =
        localizedMessage ??
        latestMood.translatedText ??
        latestMood.textInput ??
        t("home.moodStatus", "Mood: {mood} ({confidence}% confidence)")
          .replace("{mood}", latestMood.mood)
          .replace("{confidence}", String(latestMood.confidence));

      const res = await apiRequest("POST", "/api/mood/tts", {
        text: textToSpeak,
        language,
      });
      const data = await res.json();
      if (!data?.audioUrl) {
        throw new Error("No audioUrl returned");
      }
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("Unable to generate TTS", error);
      setLiveStatus(t("home.audioError", "Audio playback is unavailable. Please try again later."));
      vibrate("warning");
    } finally {
      setIsPlayingAudio(false);
    }
  };
  
  const sendSmsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/support/sms", {
        phone: "demo-user",
        message:
          localizedMessage ??
          t("home.crisisSmsDefaultMessage", "I'm requesting a MoodFlow support check-in."),
        language,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("home.crisisSmsSentTitle", "Support message queued"),
        description: t("home.crisisSmsSentBody", "A demo SMS notification has been simulated."),
      });
    },
    onError: () => {
      toast({
        title: t("home.crisisSmsErrorTitle", "Unable to send right now"),
        description: t("home.crisisSmsErrorBody", "Please try again shortly."),
        variant: "destructive",
      });
    },
  });
  
  const handleTaskToggle = (id: string) => {
    const isCompleted = completedTasks.has(id);
    const newCompleted = !isCompleted;
    
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (newCompleted) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    
    updateTaskMutation.mutate({ id, completed: newCompleted });
  };
  
  const getTimeAgo = useCallback((timestamp?: string | null) => {
    if (!timestamp) return t("home.never", "Never");
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return t("home.never", "Never");

    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffInSeconds < 1) return relativeTimeFormatter.format(0, "second");
    if (diffInSeconds < 60) return relativeTimeFormatter.format(-diffInSeconds, "second");

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return relativeTimeFormatter.format(-diffInMinutes, "minute");

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return relativeTimeFormatter.format(-diffInHours, "hour");

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return relativeTimeFormatter.format(-diffInDays, "day");

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return relativeTimeFormatter.format(-diffInMonths, "month");

    const diffInYears = Math.floor(diffInMonths / 12);
    return relativeTimeFormatter.format(-diffInYears, "year");
  }, [relativeTimeFormatter, t]);

  const moodIndicatorClass = useMemo(() => {
    switch (mood) {
      case "stressed":
        return "border-red-500";
      case "energized":
        return "border-yellow-400";
      case "calm":
        return "border-sky-400";
      case "focused":
        return "border-purple-500";
      default:
        return "border-slate-400";
    }
  }, [mood]);
  
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden pb-16 transition-colors",
        isDark ? "bg-[#0f1424] text-slate-100" : "bg-[#f3edff] text-slate-900"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full opacity-60 blur-[140px]",
          isDark ? "bg-[#1c2b55]" : "bg-[#9dbbff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full opacity-50 blur-[160px]",
          isDark ? "bg-[#123b46]" : "bg-[#8df5ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-45 blur-[220px]",
          isDark ? "bg-[#37215b]" : "bg-[#ffbff3]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 text-slate-900 dark:text-slate-100">
        <section className="pt-16">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#7d5bff] via-[#a96cff] to-[#41c0ff] p-10 text-white shadow-[0_35px_80px_-40px_rgba(88,27,190,0.6)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                  {t("home.welcomeTitle", "Welcome to MoodFlow! 👋")}
                </p>
                <h2 className="mt-2 text-4xl font-bold">
                  {t("home.welcomeTitle", "Welcome to MoodFlow! 👋")}
                </h2>
                <p className="mt-3 text-lg text-white/85">
                  {t("home.welcomeSubtitle", "How are you feeling today?")}
                </p>
              </div>
              <div className="rounded-3xl bg-white/15 px-10 py-5 text-center shadow-inner backdrop-blur-lg">
                <p className="text-sm uppercase tracking-wide text-white/75">
                  {t("home.streakLabel", "Day streak")}
                </p>
                <p className="text-5xl font-bold leading-none">{streak}</p>
            </div>
          </div>
        </div>

          {crisisSummary?.triggered && (
            <Alert className="mt-8 border-red-200 bg-red-50/90 text-red-900 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-100" variant="destructive">
              <AlertTitle>{t("home.crisisTitle", "You’re not alone—we’ve got you.")}</AlertTitle>
              <AlertDescription className="mt-2 space-y-3 text-sm">
                <p>{t("home.crisisDescription", "We noticed signs that you might be going through a tough moment. Consider reaching out to someone you trust or using the resources below.")}</p>
                {crisisSummary.negativeMoodStreak > 0 && (
                  <p>
                    {t("home.crisisNegativeStreak", "High-intensity stressed moods logged: {count} in the past three days.")
                      .replace("{count}", String(crisisSummary.negativeMoodStreak))}
                  </p>
                )}
                {crisisSummary.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t("home.crisisKeywordsLabel", "We picked up on these phrases:")}</span>
                    {crisisSummary.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="border-red-400 bg-red-200 text-red-900 dark:border-red-500/60 dark:bg-red-500/20 dark:text-red-100"
                      >
                        {keyword}
                      </Badge>
                    ))}
        </div>
                )}
                {crisisSummary.helpline && (
                  <div className="space-y-1">
                    <p>
                      {t("home.crisisHelpline", "Recommended helpline:")}{" "}
                      <strong>{crisisSummary.helpline.name}</strong>
                    </p>
                    {crisisSummary.helpline.phone && (
                      <p>
                        {t("home.crisisCall", "Call {phone}")
                          .replace("{phone}", crisisSummary.helpline.phone)}
                      </p>
                    )}
                    {crisisSummary.helpline.url && (
                      <a
                        href={crisisSummary.helpline.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm font-medium underline"
                      >
                        {t("home.crisisVisit", "Visit the support site")}
                      </a>
                    )}
              </div>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => sendSmsMutation.mutate()}
                    disabled={sendSmsMutation.isPending}
                  >
                    {sendSmsMutation.isPending
                      ? t("home.crisisSmsSending", "Requesting support…")
                      : t("home.crisisSmsButton", "Request a check-in SMS (demo)") }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPeerSupport(true)}
                  >
                    {t("home.crisisPeerButton", "Talk to a peer supporter")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-[310px,1fr]">
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-3xl border-0 bg-white/75 p-7 shadow-lg backdrop-blur-xl dark:bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-purple-300 text-white">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {t("home.moodCheckIn", "Log Your Mood")}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {t("home.moodCheckIn", "Log Your Mood")}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#caa5ff] bg-white shadow-lg shadow-purple-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                      data-testid="button-capture-photo"
                    >
                      <Camera className="h-9 w-9 text-[#915cff]" />
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      {t("home.capture", "Capture")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setShowMoodModal(true)}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#9ad9ff] bg-white shadow-lg shadow-sky-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                      data-testid="button-voice-input"
                    >
                      <Mic className="h-8 w-8 text-[#2f98ff]" />
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      {t("home.voice", "Voice")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-[#9af6cd] bg-white shadow-lg shadow-emerald-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                      data-testid="button-hand-in"
                    >
                      <Hand className="h-8 w-8 text-[#13b87f]" />
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
                      {t("home.aiCoach", "AI Coach")}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Card
                  className="cursor-pointer rounded-3xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => setLocation("/habits")}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-200 to-green-400 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t("home.trackHabits", "Track Daily Habits")}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                        {t("home.trackHabitsDescription", "Exercise, water, meals & mindful routines.")}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer rounded-3xl border-0 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => setLocation("/meals")}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-200 to-orange-400 text-white">
                      <Coffee className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t("home.mealPlan", "Meal Plan")}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                        {t("home.mealPlanDescription", "Healthy recipes tailored to your goals.")}
                      </p>
                    </div>
                  </div>
                </Card>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-[#3efcb0] via-[#3ad7ff] to-[#5a7dff] px-6 py-5 text-left text-white shadow-[0_20px_45px_-25px_rgba(58,179,255,0.7)] transition hover:brightness-110"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold leading-tight">
                        {t("home.shareProgress", "Share Today's Progress")}
                      </p>
                      <p className="text-xs text-white/80">
                        {t("home.shareProgressDescription", "Celebrate your journey with a friend")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{t("home.shareProgress", "Share Today's Progress")}</span>
                </button>
              </div>

          </div>

            <div className="space-y-6">
              <Card className="rounded-3xl border-0 bg-white/75 p-8 shadow-lg backdrop-blur-xl dark:bg-slate-900/70" role="region" aria-live="polite">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {t("home.currentMood", "Current mood")}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold capitalize text-slate-800 dark:text-slate-100">{mood}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {t("home.lastUpdated", "Last updated")}: {getTimeAgo(latestMood?.timestamp)}
                    </p>
                  </div>
                  <Badge className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                    {confidence}% {t("home.confidence", "confident")}
                </Badge>
                  <span
                    className={cn("ml-2 h-10 w-10 rounded-full border-4", moodIndicatorClass)}
                    aria-label={t("home.visualMoodCue", "Visual mood indicator")}
                    aria-hidden={false}
                  />
              </div>
                <div className="mt-7 text-5xl" aria-hidden="true">
                  {mood === "energized" && "😄"}
                  {mood === "calm" && "😌"}
                  {mood === "stressed" && "😔"}
                  {mood === "focused" && "🧠"}
                  {mood === "neutral" && "😐"}
                </div>
                {(localizedMessage || latestMood?.translatedText) && (
                  <div className="mt-6 space-y-2" role="status">
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {localizedMessage ?? latestMood?.translatedText}
                    </p>
                    {latestMood?.originalLanguage &&
                      latestMood?.translatedLanguage &&
                      latestMood.originalLanguage !== latestMood.translatedLanguage && (
                        <Badge variant="outline" className="bg-transparent text-xs text-slate-600 dark:text-slate-300">
                          {t("home.translatedFrom", "Translated from {language}").replace(
                            "{language}",
                            getLanguageName(latestMood.originalLanguage),
                          )}
                        </Badge>
                      )}
                    {latestMood?.originalText &&
                      latestMood?.originalLanguage &&
                      latestMood.originalText.trim().length > 0 &&
                      latestMood.originalText.trim().toLowerCase() !==
                        (latestMood.translatedText ?? "").trim().toLowerCase() && (
                        <p className="text-sm italic text-slate-500 dark:text-slate-400">
                          “{latestMood.originalText}”
                        </p>
                      )}
                </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio || !latestMood}
                  >
                    {isPlayingAudio ? t("home.playingAudio", "Playing…") : t("home.playAudio", "Play audio summary")}
                  </Button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("home.hapticsNotice", "Vibration feedback activates if your device supports it.")}
                  </span>
              </div>
            </Card>

              <Card className="rounded-3xl border-0 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:bg-slate-900/70">
                <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {t("home.adaptiveTasks", "Your adaptive tasks")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
                      {t("home.adaptiveTasksDescription", "Tasks tailored for your {mood} mood").replace("{mood}", mood)}
                    </h3>
                </div>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                    className="rounded-full border-purple-200 bg-white text-purple-600 hover:bg-purple-50 dark:border-purple-500/40 dark:bg-slate-900/80 dark:text-purple-200 dark:hover:bg-slate-800"
                >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t("home.regenerate", "Regenerate")}
                </Button>
              </div>
              
              {tasks.length === 0 && altTasks.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 py-12 text-center shadow-inner dark:bg-slate-800/60">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow dark:bg-slate-900">
                      <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                    <p className="text-slate-500 dark:text-slate-300">
                      {t("home.noTasks", "No tasks yet. Log your current mood to see fresh recommendations.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(tasks.length ? tasks : altTasks).slice(0, 5).map((task) => (
                    <TaskCard
                      key={task.id}
                      {...task}
                      difficulty={task.difficulty as DifficultyType}
                      completed={completedTasks.has(task.id) || task.completed === 1}
                      onToggle={handleTaskToggle}
                    />
                  ))}
                </div>
              )}
            </Card>

            </div>
          </div>
        </section>
      </main>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onStreamFrame={handleLiveFrame}
          autoLive
          statusText={liveStatus}
          onClose={() => setShowCamera(false)}
        />
      )}
      
      <MoodDetectionModal
        open={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onDetect={handleMoodDetection}
      />
      
      <ShareProgressModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        mood={mood}
        streak={streak}
        completedTasks={completedTasks}
        totalTasks={tasks?.length || 0}
      />
      <ChatbotWidget onRequestPeerSupport={() => setShowPeerSupport(true)} />
      <PeerSupportDrawer
        open={showPeerSupport}
        onOpenChange={setShowPeerSupport}
        mood={mood}
        experiences={peerExperiences}
      />
    </div>
  );
}
