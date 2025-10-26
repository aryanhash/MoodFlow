import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

type BreathingPhase = "inhale" | "hold" | "exhale";

interface BreathingExerciseProps {
  duration?: number;
  onComplete?: () => void;
}

export default function BreathingExercise({ duration = 60, onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [phaseTime, setPhaseTime] = useState(0);
  
  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 4,
  };
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete?.();
          return duration;
        }
        return prev - 1;
      });
      
      setPhaseTime((prev) => {
        const nextTime = prev + 1;
        if (nextTime >= phaseDurations[phase]) {
          if (phase === "inhale") setPhase("hold");
          else if (phase === "hold") setPhase("exhale");
          else setPhase("inhale");
          return 0;
        }
        return nextTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, phase, duration, onComplete]);
  
  const getScale = () => {
    if (phase === "inhale") {
      return 1 + (phaseTime / phaseDurations.inhale) * 0.5;
    } else if (phase === "exhale") {
      return 1.5 - (phaseTime / phaseDurations.exhale) * 0.5;
    }
    return 1.5;
  };
  
  const phaseLabels = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
  };
  
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-accent font-semibold mb-2">Breathing Exercise</h2>
          <p className="text-muted-foreground">Take a moment to relax and breathe</p>
        </div>
        
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 blur-xl transition-transform duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${getScale()})` }}
          />
          <div
            className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 transition-transform duration-[4000ms] ease-in-out flex items-center justify-center"
            style={{ transform: `scale(${getScale()})` }}
          >
            <div className="text-white text-center">
              <div className="text-3xl font-accent font-semibold mb-2">
                {phaseLabels[phase]}
              </div>
              <div className="text-6xl font-bold">
                {timeLeft}s
              </div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => setIsActive(!isActive)}
          size="lg"
          className="min-w-32"
          data-testid="button-breathing-toggle"
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
