import { MoodType } from "@shared/schema";

export const moodThemes = {
  calm: {
    emoji: "😌",
    label: "Calm & Relaxed",
    gradient: "from-sky-400 to-blue-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/20",
    textColor: "text-sky-600 dark:text-sky-400",
    accentColor: "hsl(200 85% 50%)",
  },
  energized: {
    emoji: "⚡",
    label: "Energized & Motivated",
    gradient: "from-orange-400 to-amber-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    textColor: "text-orange-600 dark:text-orange-400",
    accentColor: "hsl(28 88% 50%)",
  },
  stressed: {
    emoji: "😰",
    label: "Stressed & Anxious",
    gradient: "from-emerald-300 to-purple-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    accentColor: "hsl(160 72% 40%)",
  },
  focused: {
    emoji: "🎯",
    label: "Focused & Determined",
    gradient: "from-violet-500 to-indigo-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    textColor: "text-violet-600 dark:text-violet-400",
    accentColor: "hsl(260 68% 55%)",
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    gradient: "from-gray-400 to-cyan-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    textColor: "text-gray-600 dark:text-gray-400",
    accentColor: "hsl(190 50% 50%)",
  },
};

export function getMoodTheme(mood: MoodType) {
  return moodThemes[mood] || moodThemes.neutral;
}
