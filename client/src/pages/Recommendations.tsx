import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Music, BookOpen, Film, Video, Shirt } from "lucide-react";
import RecommendationCard from "@/components/RecommendationCard";

//todo: remove mock functionality
const mockRecommendations = {
  workouts: {
    icon: Dumbbell,
    title: "Quick Workouts",
    category: "Fitness",
    items: [
      "5-minute desk stretches",
      "10-minute yoga flow",
      "15-minute HIIT cardio",
    ],
  },
  music: {
    icon: Music,
    title: "Calm Playlists",
    category: "Music",
    items: [
      "Peaceful Piano",
      "Ambient Relaxation",
      "Chill Vibes",
    ],
  },
  books: {
    icon: BookOpen,
    title: "Recommended Reads",
    category: "Books",
    items: [
      "Atomic Habits - James Clear",
      "The Power of Now - Eckhart Tolle",
      "Deep Work - Cal Newport",
    ],
  },
  movies: {
    icon: Film,
    title: "Feel-Good Movies",
    category: "Entertainment",
    items: [
      "The Secret Life of Walter Mitty",
      "Soul (Pixar)",
      "The Grand Budapest Hotel",
    ],
  },
  recipes: {
    icon: Video,
    title: "Recipe Videos",
    category: "Cooking",
    items: [
      "15-Minute Healthy Meals",
      "Comfort Food Classics",
      "Easy Meal Prep Ideas",
    ],
  },
  outfits: {
    icon: Shirt,
    title: "Outfit Ideas",
    category: "Fashion",
    items: [
      "Casual comfort style",
      "Professional yet relaxed",
      "Weekend casual chic",
    ],
  },
};

export default function Recommendations() {
  const [, setLocation] = useLocation();
  
  const handleItemClick = (item: string) => {
    //todo: remove mock functionality - integrate with real search/recommendation APIs
    const searchQuery = encodeURIComponent(item);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    console.log("Recommendation clicked:", item);
  };
  
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
            <h1 className="text-2xl font-accent font-semibold">Mood-Based Recommendations</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Curated for Your Mood</h2>
          <p className="text-muted-foreground">
            Personalized suggestions to enhance your current state
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(mockRecommendations).map((rec, idx) => (
            <RecommendationCard
              key={idx}
              icon={rec.icon}
              title={rec.title}
              category={rec.category}
              items={rec.items}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
