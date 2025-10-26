import { Card } from "@/components/ui/card";
import { getMoodTheme } from "@/lib/moodThemes";
import { MoodType } from "@shared/schema";

interface MoodCardProps {
  mood: MoodType;
  confidence: number;
  lastUpdated?: string;
}

export default function MoodCard({ mood, confidence, lastUpdated }: MoodCardProps) {
  const theme = getMoodTheme(mood);
  
  return (
    <Card className="p-8 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-5`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Current Mood</h2>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">{lastUpdated}</span>
          )}
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="text-8xl">{theme.emoji}</div>
          <div className={`text-2xl font-accent font-semibold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            {theme.label}
          </div>
          
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <span className={`text-sm font-semibold ${theme.textColor}`}>
                {confidence}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
