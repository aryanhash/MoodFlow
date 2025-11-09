import { useCallback } from "react";

type HapticPattern = "success" | "warning" | "error";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  success: [40],
  warning: [60, 30, 60],
  error: [100, 40, 100],
};

export const useHaptics = () => {
  const vibrate = useCallback((pattern: HapticPattern) => {
    if (typeof window === "undefined") return;
    const navigatorAny = navigator as any;
    if (navigatorAny?.vibrate) {
      navigatorAny.vibrate(PATTERNS[pattern]);
    }
  }, []);

  return { vibrate };
};

