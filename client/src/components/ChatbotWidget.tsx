import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, SendHorizonal, Loader2, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { getLanguageName } from "@/lib/language";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HelplineInfo } from "@shared/schema";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  language: string;
  translatedFrom?: string | null;
  crisis?: boolean;
}

interface EmpathyResponse {
  message: string;
  language: string;
  detectedLanguage?: string | null;
  translationApplied: boolean;
  peerSupportSuggested: boolean;
  crisisKeywords?: string[] | null;
  helpline?: HelplineInfo | null;
}

interface ChatbotWidgetProps {
  onRequestPeerSupport?: () => void;
}

const CHAT_STORAGE_KEY = "moodflow.chatHistory.v1";

const createStarterMessages = (title: string, subtitle: string, language: string): ChatMessage[] => [
  {
    id: `assistant-seed-1`,
    role: "assistant",
    text: title,
    timestamp: new Date().toISOString(),
    language,
  },
  {
    id: `assistant-seed-2`,
    role: "assistant",
    text: subtitle,
    timestamp: new Date().toISOString(),
    language,
  },
];

const formatTimestamp = (language: string, value: string) => {
  try {
    const formatter = new Intl.DateTimeFormat(language, {
      hour: "numeric",
      minute: "numeric",
    });
    return formatter.format(new Date(value));
  } catch {
    return new Date(value).toLocaleTimeString();
  }
};

export default function ChatbotWidget({ onRequestPeerSupport }: ChatbotWidgetProps = {}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [crisisKeywords, setCrisisKeywords] = useState<string[] | null>(null);
  const [crisisHelpline, setCrisisHelpline] = useState<HelplineInfo | null>(null);
  const [showPeerSuggestion, setShowPeerSuggestion] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (error) {
      console.warn("Unable to load chat history", error);
    }
    setMessages(
      createStarterMessages(
        t("chat.title", "MoodFlow AI Friend"),
        t("chat.subtitle", "Wellness Companion"),
        language,
      ),
    );
  }, [t, language]);

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn("Unable to persist chat history", error);
    }
  }, [messages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isAssistantTyping]);

  const placeholder = useMemo(() => {
    if (!isOpen) return "";
    return t("chat.placeholder", "Type how you're feeling...");
  }, [isOpen, t]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isAssistantTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
      language,
    };

    addMessage(userMessage);
    setInput("");
    setIsAssistantTyping(true);
    setCrisisKeywords(null);
    setCrisisHelpline(null);

    try {
      const res = await apiRequest("POST", "/api/chat/empathy", {
        message: trimmed,
        language,
        userId: "default",
      });
      const data: EmpathyResponse = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.message,
        timestamp: new Date().toISOString(),
        language: data.language,
        translatedFrom: data.translationApplied ? data.detectedLanguage ?? null : null,
      };
      addMessage(assistantMessage);

      if (data.peerSupportSuggested && !showPeerSuggestion) {
        setShowPeerSuggestion(true);
        addMessage({
          id: `assistant-peer-${Date.now()}`,
          role: "assistant",
          text: t(
            "chat.peerSupportMessage",
            "You’ve been facing a lot lately. Would it help to connect with someone who understands?",
          ),
          timestamp: new Date().toISOString(),
          language,
          crisis: false,
        });
      }

      if (data.helpline) {
        setCrisisHelpline(data.helpline);
      } else {
        setCrisisHelpline(null);
      }

      if (data.crisisKeywords && data.crisisKeywords.length > 0) {
        setCrisisKeywords(data.crisisKeywords);
        addMessage({
          id: `assistant-crisis-${Date.now()}`,
          role: "assistant",
          text: t(
            "chat.crisisDetected",
            "If you’re in immediate danger, please reach out to local emergency services.",
          ),
          timestamp: new Date().toISOString(),
          language,
          crisis: true,
        });
      }
    } catch (error) {
      console.error("Empathy chat error", error);
      toast({
        title: "Chat unavailable",
        description: "I couldn’t reach the empathy companion. Please try again in a moment.",
        variant: "destructive",
      });
      addMessage({
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        text: "I’m still here with you. Even when the tech hiccups, your feelings matter. 💜",
        timestamp: new Date().toISOString(),
        language,
      });
    } finally {
      setIsAssistantTyping(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl hover:from-purple-600 hover:to-blue-600"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close wellness chat" : "Open wellness chat"}
        aria-haspopup="dialog"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-sm"
          >
            <Card className="overflow-hidden border-2 border-purple-100 shadow-2xl">
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-white">
                <div>
                  <p className="text-sm uppercase tracking-wide opacity-80">{t("chat.subtitle", "Wellness Companion")}</p>
                  <h3 className="text-base font-semibold">{t("chat.title", "MoodFlow AI Friend")}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {crisisKeywords && crisisKeywords.length > 0 && (
                <div className="flex items-start gap-3 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  <ShieldAlert className="mt-0.5 h-4 w-4" />
                  <div className="space-y-1">
                    <p>{t("chat.crisisDetected", "If you’re in immediate danger, please reach out to local emergency services.")}</p>
                    {crisisHelpline && (
                      <div className="text-[11px] font-normal text-red-800">
                        <p className="font-semibold">{crisisHelpline.name}</p>
                        {crisisHelpline.phone && <p>{crisisHelpline.phone}</p>}
                        {crisisHelpline.url && (
                          <a
                            href={crisisHelpline.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {crisisHelpline.url}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div
                ref={listRef}
                className="max-h-80 overflow-y-auto bg-white px-4 py-3 space-y-3"
                role="log"
                aria-live="polite"
                aria-label={t("chat.subtitle", "Wellness Companion")}
              >
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          isUser
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : message.crisis
                            ? "bg-red-50 text-red-800"
                            : "bg-purple-50 text-purple-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[10px] opacity-70">
                          <span>{formatTimestamp(language, message.timestamp)}</span>
                          {!isUser && message.translatedFrom && (
                            <span>
                              {t("chat.translatedFrom", "Translated from {language}").replace(
                                "{language}",
                                getLanguageName(message.translatedFrom),
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isAssistantTyping && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-purple-50 px-3 py-2 text-sm text-purple-900 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("chat.typing", "Reflecting with you…")}</span>
                    </div>
                  </div>
                )}
              </div>

              {showPeerSuggestion && (
                <div className="space-y-2 border-t border-purple-100 bg-purple-50 px-4 py-3 text-xs text-purple-800">
                  <p className="font-semibold">{t("chat.peerSupportTitle", "Care suggestion")}</p>
                  <p>{t("chat.peerSupportMessage", "You’ve been facing a lot lately. Would it help to connect with someone who understands?")}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    onClick={() => {
                      onRequestPeerSupport?.();
                      setIsOpen(false);
                    }}
                  >
                    {t("chat.peerSupportAction", "Explore peer support")}
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-purple-100 bg-white px-3 py-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={placeholder}
                  className="text-sm"
                  disabled={isAssistantTyping}
                />
                <Button type="submit" size="icon" disabled={isAssistantTyping}>
                  {isAssistantTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
