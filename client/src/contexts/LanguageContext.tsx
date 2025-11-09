import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "@/lib/queryClient";
import {
  getPreferredLanguage,
  persistPreferredLanguage,
  isRTL,
} from "@/lib/language";

const SUPPORTED_LANGUAGES = ["en", "hi", "es", "zh", "ar"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  loading: boolean;
  supportedLanguages: SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const ensureSupported = (lang: string | null | undefined): SupportedLanguage => {
  if (!lang) return DEFAULT_LANGUAGE;
  const lower = lang.toLowerCase();
  return (
    SUPPORTED_LANGUAGES.find(
      (supported) => supported.toLowerCase() === lower,
    ) ?? DEFAULT_LANGUAGE
  );
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() =>
    ensureSupported(getPreferredLanguage()),
  );
  const [loading, setLoading] = useState(true);

  const applyDocumentLanguage = useCallback((lang: SupportedLanguage) => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
  }, []);

  const persistLanguage = useCallback((lang: SupportedLanguage) => {
    persistPreferredLanguage(lang);
    applyDocumentLanguage(lang);
  }, [applyDocumentLanguage]);

  useEffect(() => {
    persistLanguage(language);
  }, [language, persistLanguage]);

  useEffect(() => {
    let isMounted = true;

    const resolveLanguagePreference = async () => {
      let resolved = language;

      // Step 1: Backend preference
      try {
        const res = await apiRequest(
          "GET",
          "/api/settings?userId=default",
        );
        const data = await res.json();
        if (data?.preferredLanguage) {
          resolved = ensureSupported(data.preferredLanguage);
        }
      } catch (error) {
        console.warn("Unable to fetch preferred language from backend", error);
      }

      // Step 2: IP-based fallback if still default and no explicit storage
      const stored = localStorage.getItem("preferredLanguage");
      if (!stored && resolved === DEFAULT_LANGUAGE) {
        try {
          const geoRes = await fetch("https://ipapi.co/json/");
          if (geoRes.ok) {
            const geo = await geoRes.json();
            const countryLangMap: Record<string, SupportedLanguage> = {
              IN: "hi",
              ES: "es",
              MX: "es",
              AR: "es",
              CN: "zh",
              TW: "zh",
              HK: "zh",
              AE: "ar",
              SA: "ar",
              QA: "ar",
            };
            const geoLang = countryLangMap[geo?.country_code];
            if (geoLang) {
              resolved = geoLang;
            }
          }
        } catch (error) {
          console.warn("IP-based language detection failed", error);
        }
      }

      if (isMounted) {
        setLanguageState(ensureSupported(resolved));
        setLoading(false);
      }
    };

    resolveLanguagePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    apiRequest("PATCH", "/api/settings?userId=default", {
      preferredLanguage: language,
    }).catch((error) =>
      console.warn("Unable to persist preferred language", error),
    );
  }, [language, loading]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguageState(ensureSupported(lang));
    },
    [],
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      loading,
      supportedLanguages: [...SUPPORTED_LANGUAGES],
    }),
    [language, loading, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

