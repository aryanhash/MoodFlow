import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Twitter, Facebook, Instagram, Share, Download } from "lucide-react";
import { MoodType } from "@shared/schema";

interface HabitsData {
  exercise: boolean;
  waterGlasses: number;
  screenTime: number;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

interface ShareProgressModalProps {
  open: boolean;
  onClose: () => void;
  mood: MoodType;
  streak: number;
  completedTasks: Set<string>;
  totalTasks: number;
}

export default function ShareProgressModal({
  open,
  onClose,
  mood,
  streak,
  completedTasks,
  totalTasks
}: ShareProgressModalProps) {
  const [copied, setCopied] = useState(false);
  const [habits, setHabits] = useState<HabitsData>({
    exercise: false,
    waterGlasses: 0,
    screenTime: 0,
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
  });

  // Load habits data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('dailyHabits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, [open]); // Reload when modal opens

  const getMoodEmoji = (mood: MoodType) => {
    const emojis = {
      energized: "😄",
      calm: "😌", 
      stressed: "😔",
      focused: "🧠",
      neutral: "😐"
    };
    return emojis[mood] || "😐";
  };

  const getMoodText = (mood: MoodType) => {
    const texts = {
      energized: "Energetic & Motivated",
      calm: "Calm & Peaceful",
      stressed: "Stressed & Need Support", 
      focused: "Focused & Productive",
      neutral: "Balanced & Neutral"
    };
    return texts[mood] || "Balanced & Neutral";
  };

  const getCompletedMeals = () => {
    return Object.values(habits.meals).filter(Boolean).length;
  };

  const progressText = `🧭 Daily Compass Progress

✨ Mood: ${getMoodEmoji(mood)} ${getMoodText(mood)}
🎯 Daily Goal: ${completedTasks.size > 0 ? "Completed" : "In Progress"}
🍽️ Meals: ${getCompletedMeals()}/3
💧 Water: ${habits.waterGlasses}/8 glasses
🏋️ Exercise: ${habits.exercise ? "Completed" : "Not yet"}
📱 Screen Time: ${habits.screenTime}h
🔥 Streak: ${streak} days

#MoodFlow #WellnessJourney #DailyProgress`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(progressText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(progressText)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(progressText)}`;
    window.open(url, '_blank');
  };

  const handleInstagramShare = () => {
    handleCopyToClipboard();
  };

  const handleOtherAppsShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Daily Progress',
        text: progressText,
        url: window.location.href
      });
    } else {
      handleCopyToClipboard();
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([progressText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-progress-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Share Your Progress</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Progress Card */}
          <Card className="p-6 bg-white border border-gray-200">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">🧭 Daily Compass Progress</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Mood: {getMoodEmoji(mood)} {getMoodText(mood)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Daily Goal: {completedTasks.size > 0 ? "Completed" : "In Progress"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🍽️</span>
                  <span>Meals: {getCompletedMeals()}/3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💧</span>
                  <span>Water: {habits.waterGlasses}/8 glasses</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏋️</span>
                  <span>Exercise: {habits.exercise ? "Completed" : "Not yet"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Screen Time: {habits.screenTime}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span>Streak: {streak} days</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleTwitterShare}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-lg flex items-center gap-3"
            >
              <Twitter className="w-5 h-5" />
              Share on Twitter
            </Button>

            <Button
              onClick={handleFacebookShare}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center gap-3"
            >
              <Facebook className="w-5 h-5" />
              Share on Facebook
            </Button>

            <Button
              onClick={handleInstagramShare}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg flex items-center gap-3"
            >
              <Instagram className="w-5 h-5" />
              Share on Instagram {copied ? "(Copied!)" : "(Copy)"}
            </Button>

            <Button
              onClick={handleOtherAppsShare}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center gap-3"
            >
              <Share className="w-5 h-5" />
              Share via Other Apps
            </Button>

            <Button
              onClick={handleDownloadFile}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg flex items-center gap-3"
            >
              <Download className="w-5 h-5" />
              Download as File
            </Button>
          </div>

          {/* Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">💡</span>
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> For Instagram, copy the text and paste it on a colorful background using Instagram Stories!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
