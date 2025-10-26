import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealCard from "@/components/MealCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import breakfastImage from '@assets/generated_images/Healthy_breakfast_avocado_toast_b085d880.png';
import lunchImage from '@assets/generated_images/Healthy_lunch_buddha_bowl_b1a819ea.png';
import dinnerImage from '@assets/generated_images/Healthy_dinner_salmon_plate_ec0bbd3d.png';

//todo: remove mock functionality
const mockMeals = {
  breakfast: [
    {
      name: "Avocado Toast with Poached Eggs",
      image: breakfastImage,
      reason: "Perfect energizing breakfast for your calm mood",
      healthScore: 92,
      healthySwap: "Use whole grain bread instead of white bread",
    },
    {
      name: "Greek Yogurt Parfait",
      image: breakfastImage,
      reason: "Light and nutritious to start your day",
      healthScore: 88,
      healthySwap: "Choose low-fat Greek yogurt for fewer calories",
    },
    {
      name: "Oatmeal with Berries",
      image: breakfastImage,
      reason: "Slow-release energy for sustained focus",
      healthScore: 95,
      healthySwap: "Use steel-cut oats for more fiber",
    },
  ],
  lunch: [
    {
      name: "Quinoa Buddha Bowl",
      image: lunchImage,
      reason: "Balanced nutrition to maintain your energy",
      healthScore: 94,
      healthySwap: "Add more leafy greens for extra nutrients",
    },
    {
      name: "Grilled Chicken Salad",
      image: lunchImage,
      reason: "Protein-rich meal for afternoon productivity",
      healthScore: 90,
      healthySwap: "Use olive oil instead of creamy dressing",
    },
    {
      name: "Veggie Wrap",
      image: lunchImage,
      reason: "Light but satisfying meal",
      healthScore: 86,
      healthySwap: "Choose whole wheat wrap for more fiber",
    },
  ],
  dinner: [
    {
      name: "Grilled Salmon with Vegetables",
      image: dinnerImage,
      reason: "Omega-3 rich meal to help you unwind",
      healthScore: 96,
      healthySwap: "Steam vegetables instead of roasting for fewer calories",
    },
    {
      name: "Chicken Stir-Fry",
      image: dinnerImage,
      reason: "Balanced dinner for a restful evening",
      healthScore: 89,
      healthySwap: "Use less oil and more vegetables",
    },
    {
      name: "Lentil Curry",
      image: dinnerImage,
      reason: "Plant-based protein for better digestion",
      healthScore: 91,
      healthySwap: "Reduce coconut milk for lower fat content",
    },
  ],
};

export default function Meals() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("breakfast");
  
  const handleOrder = (mealName: string) => {
    //todo: remove mock functionality - integrate with real food delivery services
    const searchQuery = encodeURIComponent(mealName);
    window.open(`https://www.google.com/search?q=${searchQuery}+food+delivery`, '_blank');
    console.log("Order:", mealName);
  };
  
  const handleCook = (mealName: string) => {
    //todo: remove mock functionality - integrate with YouTube API
    const searchQuery = encodeURIComponent(`${mealName} recipe`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    console.log("Cook:", mealName);
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
            <h1 className="text-2xl font-accent font-semibold">Meals to Brighten Your Day</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="breakfast" data-testid="tab-breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch" data-testid="tab-lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner" data-testid="tab-dinner">Dinner</TabsTrigger>
          </TabsList>
          
          {Object.entries(mockMeals).map(([category, meals]) => (
            <TabsContent key={category} value={category}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold capitalize mb-2">{category} Recommendations</h2>
                <p className="text-muted-foreground">
                  Top 3 {category} options based on your mood and health preferences
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal, idx) => (
                  <MealCard
                    key={idx}
                    {...meal}
                    category={category as "breakfast" | "lunch" | "dinner"}
                    onOrder={() => handleOrder(meal.name)}
                    onCook={() => handleCook(meal.name)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
