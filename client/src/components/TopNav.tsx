import { useMemo } from "react";
import { useLocation } from "wouter";
import { Globe } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { getLanguageName } from "@/lib/language";

const NAV_ITEMS: Array<{ label: string; href: string; testId: string }> = [
  { label: "Recommendations", href: "/recommendations", testId: "link-recommendations" },
  { label: "Meals", href: "/meals", testId: "link-meals" },
  { label: "Wellness", href: "/wellness", testId: "link-wellness" },
  { label: "Settings", href: "/settings", testId: "link-settings" },
];

export default function TopNav({ className = "" }: { className?: string }) {
  const [, setLocation] = useLocation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();

  const navItems = useMemo(
    () => [
      { ...NAV_ITEMS[0], label: t("nav.recommendations", NAV_ITEMS[0].label) },
      { ...NAV_ITEMS[1], label: t("nav.meals", NAV_ITEMS[1].label) },
      { ...NAV_ITEMS[2], label: t("nav.wellness", NAV_ITEMS[2].label) },
      { ...NAV_ITEMS[3], label: t("nav.settings", NAV_ITEMS[3].label) },
    ],
    [t],
  );

  return (
    <header className={cn("relative z-30 mx-auto mt-6 w-full max-w-6xl px-4", className)}>
      <div className="flex items-center justify-between rounded-full bg-white/60 px-6 py-3 shadow-lg backdrop-blur-xl dark:bg-slate-900/70">
        <button
          onClick={() => setLocation("/")}
          className="text-xl font-semibold text-[#2b2b5f] transition hover:opacity-80 dark:text-slate-100"
          data-testid="link-home"
        >
          <span className="bg-gradient-to-r from-[#6f4eff] to-[#00b7ff] bg-clip-text text-transparent">MoodFlow</span>
        </button>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-200">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              data-testid={item.testId}
            >
              {item.label}
            </button>
          ))}
          <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur dark:bg-slate-900/60 dark:text-slate-200">
            <Globe className="h-4 w-4" />
            <label className="sr-only">{t("nav.language", "Language")}</label>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="bg-transparent text-xs outline-none dark:bg-transparent"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageName(lang)}
                </option>
              ))}
            </select>
          </div>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

