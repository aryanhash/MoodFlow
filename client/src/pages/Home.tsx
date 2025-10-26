import { useState } from "react";
import { useLocation } from "wouter";
import MoodCard from "@/components/MoodCard";
import TaskCard from "@/components/TaskCard";
import QuickActions from "@/components/QuickActions";
import MoodDetectionModal from "@/components/MoodDetectionModal";
import { MoodType, DifficultyType } from "@shared/schema";

//todo: remove mock functionality
const mockTasks = {
  calm: [
    { id: "1", title: "Morning meditation and journaling", duration: 15, difficulty: "easy" as DifficultyType, mood: "calm" },
    { id: "2", title: "Review project documentation", duration: 30, difficulty: "medium" as DifficultyType, mood: "calm" },
    { id: "3", title: "Email responses and admin tasks", duration: 20, difficulty: "easy" as DifficultyType, mood: "calm" },
  ],
  energized: [
    { id: "4", title: "Tackle challenging coding problem", duration: 90, difficulty: "hard" as DifficultyType, mood: "energized" },
    { id: "5", title: "Brainstorm new project ideas", duration: 45, difficulty: "medium" as DifficultyType, mood: "energized" },
    { id: "6", title: "Team collaboration meeting", duration: 60, difficulty: "medium" as DifficultyType, mood: "energized" },
  ],
  stressed: [
    { id: "7", title: "Simple file organization", duration: 15, difficulty: "easy" as DifficultyType, mood: "stressed" },
    { id: "8", title: "Take a short walk outside", duration: 10, difficulty: "easy" as DifficultyType, mood: "stressed" },
    { id: "9", title: "Listen to calming music", duration: 20, difficulty: "easy" as DifficultyType, mood: "stressed" },
  ],
  focused: [
    { id: "10", title: "Deep work: Write report", duration: 120, difficulty: "hard" as DifficultyType, mood: "focused" },
    { id: "11", title: "Code review and refactoring", duration: 60, difficulty: "medium" as DifficultyType, mood: "focused" },
    { id: "12", title: "Strategic planning session", duration: 90, difficulty: "hard" as DifficultyType, mood: "focused" },
  ],
  neutral: [
    { id: "13", title: "Routine tasks and follow-ups", duration: 30, difficulty: "medium" as DifficultyType, mood: "neutral" },
    { id: "14", title: "Read industry articles", duration: 25, difficulty: "easy" as DifficultyType, mood: "neutral" },
    { id: "15", title: "Update project tracker", duration: 15, difficulty: "easy" as DifficultyType, mood: "neutral" },
  ],
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [mood, setMood] = useState<MoodType>("calm");
  const [confidence, setConfidence] = useState(85);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [webcamConsent, setWebcamConsent] = useState(false);
  const [tasks, setTasks] = useState(mockTasks[mood]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  
  const handleMoodDetection = (text: string, useWebcam: boolean) => {
    //todo: remove mock functionality - integrate with real sentiment analysis
    const moods: MoodType[] = ["calm", "energized", "stressed", "focused", "neutral"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomConfidence = Math.floor(Math.random() * 20) + 75;
    
    setMood(randomMood);
    setConfidence(randomConfidence);
    setTasks(mockTasks[randomMood]);
    console.log("Mood detected:", { text, useWebcam, mood: randomMood, confidence: randomConfidence });
  };
  
  const handleRegenerate = () => {
    //todo: remove mock functionality - implement real task regeneration
    const currentMoodTasks = [...mockTasks[mood]];
    const shuffled = currentMoodTasks.sort(() => Math.random() - 0.5);
    setTasks(shuffled);
    console.log("Tasks regenerated");
  };
  
  const handleTaskToggle = (id: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-accent font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              MoodFlow
            </h1>
            <nav className="flex items-center gap-4">
              <button
                onClick={() => setLocation("/recommendations")}
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-lg"
                data-testid="link-recommendations"
              >
                Recommendations
              </button>
              <button
                onClick={() => setLocation("/meals")}
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-lg"
                data-testid="link-meals"
              >
                Meals
              </button>
              <button
                onClick={() => setLocation("/wellness")}
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-lg"
                data-testid="link-wellness"
              >
                Wellness
              </button>
              <button
                onClick={() => setLocation("/settings")}
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-lg"
                data-testid="link-settings"
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <MoodCard mood={mood} confidence={confidence} lastUpdated="2 mins ago" />
            <QuickActions
              onCheckMood={() => setShowMoodModal(true)}
              onRegenerate={handleRegenerate}
              onBreathing={() => setLocation("/wellness")}
              onMealRecommendation={() => setLocation("/meals")}
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-accent font-semibold mb-2">Your Adaptive Tasks</h2>
              <p className="text-muted-foreground">
                Tasks filtered for your {mood} mood
              </p>
            </div>
            
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  completed={completedTasks.has(task.id)}
                  onToggle={handleTaskToggle}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <MoodDetectionModal
        open={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onDetect={handleMoodDetection}
        webcamConsent={webcamConsent}
        onWebcamConsentChange={setWebcamConsent}
      />
    </div>
  );
}
