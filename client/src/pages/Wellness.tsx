import BreathingExercise from "@/components/BreathingExercise";
import AmbientSoundPlayer from "@/components/AmbientSoundPlayer";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function Wellness() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden transition-colors",
        isDark ? "bg-[#0f1424] text-slate-100" : "bg-[#f3edff] text-slate-900"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-48 left-[-120px] h-[480px] w-[480px] rounded-full opacity-45 blur-[190px]",
          isDark ? "bg-[#222f5c]" : "bg-[#c4d2ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[-140px] right-[-160px] h-[520px] w-[520px] rounded-full opacity-40 blur-[210px]",
          isDark ? "bg-[#123b46]" : "bg-[#91f0ff]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-slate-900 dark:text-slate-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100">Wellness & Micro-Interventions</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Breathe deeply, reset your focus, and surround yourself with calming soundscapes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 text-slate-900 dark:text-slate-100">
          <BreathingExercise
            duration={60}
            onComplete={() => console.log("Breathing exercise completed")}
          />
          <AmbientSoundPlayer />
        </div>
      </main>
    </div>
  );
}
