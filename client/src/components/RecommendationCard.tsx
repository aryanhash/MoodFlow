import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface RecommendationCardProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  category: string;
  onItemClick?: (item: string) => void;
}

export default function RecommendationCard({
  icon: Icon,
  title,
  items,
  category,
  onItemClick
}: RecommendationCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onItemClick?.(item)}
            className="w-full text-left p-3 rounded-lg bg-muted/50 hover-elevate active-elevate-2 transition-all flex items-center justify-between group"
            data-testid={`button-recommendation-${idx}`}
          >
            <span className="text-sm">{item}</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>
    </Card>
  );
}
