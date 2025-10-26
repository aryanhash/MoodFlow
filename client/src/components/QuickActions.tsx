import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Wind, UtensilsCrossed } from "lucide-react";

interface QuickActionsProps {
  onCheckMood?: () => void;
  onRegenerate?: () => void;
  onBreathing?: () => void;
  onMealRecommendation?: () => void;
}

export default function QuickActions({
  onCheckMood,
  onRegenerate,
  onBreathing,
  onMealRecommendation
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={onCheckMood}
        className="h-auto py-4 flex flex-col items-center gap-2"
        variant="outline"
        data-testid="button-check-mood"
      >
        <Activity className="w-5 h-5" />
        <span className="text-sm font-medium">Check Mood</span>
      </Button>
      
      <Button
        onClick={onRegenerate}
        className="h-auto py-4 flex flex-col items-center gap-2"
        variant="outline"
        data-testid="button-regenerate"
      >
        <RefreshCw className="w-5 h-5" />
        <span className="text-sm font-medium">Regenerate</span>
      </Button>
      
      <Button
        onClick={onBreathing}
        className="h-auto py-4 flex flex-col items-center gap-2"
        variant="outline"
        data-testid="button-breathing"
      >
        <Wind className="w-5 h-5" />
        <span className="text-sm font-medium">Breathing 60s</span>
      </Button>
      
      <Button
        onClick={onMealRecommendation}
        className="h-auto py-4 flex flex-col items-center gap-2"
        variant="outline"
        data-testid="button-meal-recommendation"
      >
        <UtensilsCrossed className="w-5 h-5" />
        <span className="text-sm font-medium">What to Order?</span>
      </Button>
    </div>
  );
}
