import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, ShieldAlert, Languages, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { PeerSupportResponse, PeerChatMessage, PeerChatResponse, PeerMatch, MoodType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PeerSupportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mood: MoodType;
  experiences?: string[];
}

interface LocalMessage extends PeerChatMessage {
  id: string;
  timestamp: number;
}

export function PeerSupportDrawer({ open, onOpenChange, mood, experiences = [] }: PeerSupportDrawerProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [match, setMatch] = useState<PeerMatch | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  const resetState = () => {
    setSessionId(null);
    setMatch(null);
    setMessages([]);
    setInput("");
    setIsInitializing(false);
  };

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    if (!sessionId && !isInitializing) {
      setIsInitializing(true);
      apiRequest("POST", "/api/peers/match", {
        userId: "default",
        language,
        mood,
        experiences,
      })
        .then((res) => res.json())
        .then((data: PeerSupportResponse) => {
          setSessionId(data.sessionId);
          setMatch(data.match);
          const introText = data.translatedIntro ?? data.originalIntro ?? "";
          if (introText.trim().length > 0) {
            const timestamp = Date.now();
            setMessages([
              {
                id: `intro-${timestamp}`,
                sender: "peer",
                text: introText,
                language,
                translatedFrom: data.translatedIntro ? data.match.language : undefined,
                flagged: false,
                timestamp,
              },
            ]);
          }
        })
        .catch((error) => {
          console.error("Peer match failed", error);
          toast({
            title: t("peer.errorTitle", "Unable to connect right now"),
            description: t("peer.errorDescription", "Please try again in a few minutes."),
            variant: "destructive",
          });
          onOpenChange(false);
        })
        .finally(() => setIsInitializing(false));
    }
  }, [open, sessionId, isInitializing, language, mood, experiences, onOpenChange, t, toast]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error("Missing session");
      const res = await apiRequest("POST", "/api/peers/chat", {
        sessionId,
        message,
        language,
      });
      return res.json() as Promise<PeerChatResponse>;
    },
    onSuccess: (data) => {
      const base = Date.now();
      setMessages((prev) => [
        ...prev,
        { ...data.userMessage, id: `user-${base}`, timestamp: base },
        { ...data.peerMessage, id: `peer-${base + 1}`, timestamp: base + 1 },
      ]);
      if (data.moderation) {
        toast({
          title: t("peer.moderationTitle", "Friendly reminder"),
          description: data.moderation,
        });
      }
      setInput("");
    },
    onError: () => {
      toast({
        title: t("peer.sendError", "Message not delivered"),
        description: t("peer.sendErrorDescription", "Please try again."),
        variant: "destructive",
      });
    },
  });

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(trimmed);
  };

  const moodBadge = useMemo(() => {
    switch (mood) {
      case "calm":
        return "bg-sky-100 text-sky-700";
      case "energized":
        return "bg-amber-100 text-amber-700";
      case "stressed":
        return "bg-rose-100 text-rose-700";
      case "focused":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }, [mood]);

  const sharedExperiences = match?.sharedExperiences ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("peer.title", "Peer Support Lounge")}</SheetTitle>
          <SheetDescription>{t("peer.subtitle", "Connect with someone who shares your lived experience.")}</SheetDescription>
        </SheetHeader>

        {isInitializing && (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("peer.connecting", "Finding the right match for you…")}
          </div>
        )}

        {!isInitializing && match && (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-3xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-500/40 dark:bg-purple-500/10">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: match.avatarColor ?? "#6366f1" }}
                >
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{match.displayName}</h3>
                    <Badge className={cn("rounded-full text-[10px]", moodBadge)}>
                      {t("peer.matchMood", "Matches your {mood} mood").replace("{mood}", mood)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300">{match.availability}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700 dark:border-purple-500/60 dark:text-purple-200">
                      <Languages className="h-3.5 w-3.5" />
                      {match.language.toUpperCase()}
                    </Badge>
                    {match.timeZone && (
                      <Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300">
                        {match.timeZone}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {sharedExperiences.length > 0 && (
                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {t("peer.sharedExperiences", "Shared experiences")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sharedExperiences.map((exp) => (
                      <Badge key={exp} variant="secondary" className="bg-white/80 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 rounded-3xl border border-slate-100 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="space-y-3">
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  return (
                    <div key={message.id} className={cn("flex", isUser ? "justify-end" : "justify-start") }>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          isUser
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                            : message.flagged
                            ? "bg-red-50 text-red-800"
                            : "bg-purple-50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-100"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] opacity-70">
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.translatedFrom && (
                            <span>
                              {t("peer.translatedFrom", "Translated from {language}").replace("{language}", message.translatedFrom)}
                            </span>
                          )}
                        </div>
                        {message.flagged && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase">
                            <ShieldAlert className="h-3 w-3" />
                            {t("peer.moderated", "Moderated message")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-8 text-center text-sm text-slate-500 dark:border-slate-600/60 dark:bg-slate-900/30 dark:text-slate-400">
                    <Sparkles className="h-5 w-5" />
                    {t("peer.waitingIntro", "Waiting for your peer to say hi…")}
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("peer.inputPlaceholder", "Share how you’re feeling. Your peer will reply in your language.")}
                className="min-h-[100px] resize-none"
                disabled={sendMessageMutation.isPending}
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  {t("peer.endChat", "End conversation")}
                </Button>
                <Button type="submit" disabled={sendMessageMutation.isPending || !input.trim()}>
                  {sendMessageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("peer.send", "Send")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default PeerSupportDrawer;
