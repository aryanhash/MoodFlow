const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
};

const RTL_LANG_CODES = new Set(["ar", "he", "fa", "ur"]);

export const getPreferredLanguage = (): string => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("preferredLanguage");
  if (stored) return stored;
  const browserLang = navigator.language.split("-")[0];
  return browserLang || "en";
};

export const persistPreferredLanguage = (lang: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("preferredLanguage", lang);
};

export const getLanguageName = (code?: string | null): string => {
  if (!code) return "Unknown";
  const normalized = code.toLowerCase();
  return LANGUAGE_NAMES[normalized] || normalized.toUpperCase();
};

export const isRTL = (code?: string | null): boolean => {
  if (!code) return false;
  return RTL_LANG_CODES.has(code.toLowerCase());
};


