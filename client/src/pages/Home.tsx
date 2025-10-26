import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import MoodCard from "@/components/MoodCard";
import TaskCard from "@/components/TaskCard";
import QuickActions from "@/components/QuickActions";
import MoodDetectionModal from "@/components/MoodDetectionModal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MoodType, DifficultyType, Task } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [mood, setMood] = useState<MoodType>("neutral");
  const [confidence, setConfidence] = useState(0);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  
  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings?userId=default");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });
  
  // Fetch latest mood
  const { data: latestMood } = useQuery({
    queryKey: ["/api/mood/latest"],
    queryFn: async () => {
      const res = await fetch("/api/mood/latest?userId=default");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch mood");
      return res.json();
    },
  });
  
  // Update local state when latest mood changes
  useEffect(() => {
    if (latestMood) {
      setMood(latestMood.mood);
      setConfidence(latestMood.confidence);
    }
  }, [latestMood]);
  
  // Fetch tasks based on mood
  const { data: tasks = [], refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks", mood],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?mood=${mood}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!mood,
  });
  
  // Mood detection mutation
  const detectMoodMutation = useMutation({
    mutationFn: async ({ text, useWebcam }: { text: string; useWebcam: boolean }) => {
      const res = await apiRequest("POST", "/api/mood/detect", { text, useWebcam, userId: "default" });
      return res.json();
    },
    onSuccess: (data) => {
      setMood(data.mood);
      setConfidence(data.confidence);
      queryClient.invalidateQueries({ queryKey: ["/api/mood/latest"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
  
  // Task completion mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
      return res.json();
    },
  });
  
  const handleMoodDetection = (text: string, useWebcam: boolean) => {
    detectMoodMutation.mutate({ text, useWebcam });
  };
  
  const handleRegenerate = () => {
    refetchTasks();
  };
  
  const handleTaskToggle = (id: string) => {
    const isCompleted = completedTasks.has(id);
    const newCompleted = !isCompleted;
    
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (newCompleted) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    
    updateTaskMutation.mutate({ id, completed: newCompleted });
  };
  
  const getTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
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
            <MoodCard 
              mood={mood} 
              confidence={confidence} 
              lastUpdated={getTimeAgo(latestMood?.timestamp)}
            />
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
            
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No tasks available. Check your mood to get personalized recommendations.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    {...task}
                    difficulty={task.difficulty as DifficultyType}
                    completed={completedTasks.has(task.id) || task.completed === 1}
                    onToggle={handleTaskToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <MoodDetectionModal
        open={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onDetect={handleMoodDetection}
        webcamConsent={settings?.webcamConsent || false}
        onWebcamConsentChange={() => {}}
      />
    </div>
  );
}
