import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BreathingExercise from "@/components/BreathingExercise";
import AmbientSoundPlayer from "@/components/AmbientSoundPlayer";

export default function Wellness() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-accent font-semibold">Wellness & Micro-Interventions</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
