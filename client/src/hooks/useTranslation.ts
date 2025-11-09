import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  translations,
  DEFAULT_TRANSLATION_LANGUAGE,
  TranslationLanguage,
} from "@/i18n/dictionaries";

const getNestedValue = (obj: any, path: string[]): string | undefined => {
  return path.reduce((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const dictionary = useMemo(() => {
    const lang = language as TranslationLanguage;
    return translations[lang] ?? translations[DEFAULT_TRANSLATION_LANGUAGE];
  }, [language]);

  const fallbackDictionary = translations[DEFAULT_TRANSLATION_LANGUAGE];

  const t = (key: string, defaultValue: string): string => {
    const path = key.split(".");
    const value =
      getNestedValue(dictionary, path) ??
      getNestedValue(fallbackDictionary, path);
    return typeof value === "string" ? value : defaultValue;
  };

  return { t, language };
};


