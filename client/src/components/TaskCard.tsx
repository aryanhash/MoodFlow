import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Zap } from "lucide-react";
import { DifficultyType } from "@shared/schema";

interface TaskCardProps {
  id: string;
  title: string;
  duration: number;
  difficulty: DifficultyType;
  completed?: boolean;
  onToggle?: (id: string) => void;
}

const difficultyConfig = {
  easy: { color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400", label: "Easy" },
  medium: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400", label: "Medium" },
  hard: { color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400", label: "Hard" },
};

export default function TaskCard({ id, title, duration, difficulty, completed = false, onToggle }: TaskCardProps) {
  const diffConfig = difficultyConfig[difficulty];
  
  return (
    <Card className={`p-6 hover-elevate active-elevate-2 transition-all ${completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle?.(id)}
          className="mt-1"
          data-testid={`checkbox-task-${id}`}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-3 ${completed ? 'line-through' : ''}`}>
            {title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{duration} min</span>
            </div>
            <Badge variant="secondary" className={`${diffConfig.color} border-0`}>
              <Zap className="w-3 h-3 mr-1" />
              {diffConfig.label}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
