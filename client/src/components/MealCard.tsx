import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChefHat, Lightbulb } from "lucide-react";

interface MealCardProps {
  name: string;
  image: string;
  category: "breakfast" | "lunch" | "dinner";
  reason: string;
  healthScore: number;
  healthySwap?: string;
  onOrder?: () => void;
  onCook?: () => void;
}

export default function MealCard({
  name,
  image,
  category,
  reason,
  healthScore,
  healthySwap,
  onOrder,
  onCook
}: MealCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all dark:bg-slate-900">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{name}</h3>
          <Badge variant="secondary" className="capitalize dark:bg-slate-800 dark:text-slate-200">
            {category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 dark:text-slate-300">{reason}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Health Score:</div>
          <div className="flex-1 bg-muted rounded-full h-1.5 dark:bg-slate-800">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
            {healthScore}%
          </span>
        </div>
        
        {healthySwap && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-muted/50 dark:bg-slate-800/70">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Healthy swap:</span> {healthySwap}
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={onOrder}
            className="flex-1"
            variant="default"
            data-testid={`button-order-${name}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Order
          </Button>
          <Button
            onClick={onCook}
            className="flex-1"
            variant="outline"
            data-testid={`button-cook-${name}`}
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Cook
          </Button>
        </div>
      </div>
    </Card>
  );
}
