import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MealCard from "@/components/MealCard";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Enhanced meals with real food options and delivery integration
const mockMeals = {
  breakfast: [
    {
      name: "Avocado Toast with Poached Eggs",
      image: "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=300&fit=crop",
      reason: "Perfect energizing breakfast for your calm mood",
      healthScore: 92,
      healthySwap: "Use whole grain bread instead of white bread",
      price: "₹180",
      deliveryTime: "25-30 mins",
      restaurant: "Cafe Coffee Day"
    },
    {
      name: "Greek Yogurt Parfait",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
      reason: "Light and nutritious to start your day",
      healthScore: 88,
      healthySwap: "Choose low-fat Greek yogurt for fewer calories",
      price: "₹120",
      deliveryTime: "20-25 mins",
      restaurant: "Subway"
    },
    {
      name: "Oatmeal with Berries",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      reason: "Slow-release energy for sustained focus",
      healthScore: 95,
      healthySwap: "Use steel-cut oats for more fiber",
      price: "₹150",
      deliveryTime: "15-20 mins",
      restaurant: "McDonald's"
    },
    {
      name: "Pancakes with Maple Syrup",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      reason: "Comforting breakfast for a relaxed morning",
      healthScore: 75,
      healthySwap: "Use whole wheat flour for extra fiber",
      price: "₹200",
      deliveryTime: "30-35 mins",
      restaurant: "IHOP"
    },
    {
      name: "Smoothie Bowl",
      image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=400&h=300&fit=crop",
      reason: "Refreshing and vitamin-rich start",
      healthScore: 90,
      healthySwap: "Add chia seeds for omega-3",
      price: "₹160",
      deliveryTime: "20-25 mins",
      restaurant: "Fresh Menu"
    }
  ],
  lunch: [
    {
      name: "Quinoa Buddha Bowl",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      reason: "Balanced nutrition to maintain your energy",
      healthScore: 94,
      healthySwap: "Add more leafy greens for extra nutrients",
    },
    {
      name: "Grilled Chicken Salad",
      image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop",
      reason: "Protein-rich meal for afternoon productivity",
      healthScore: 90,
      healthySwap: "Use olive oil instead of creamy dressing",
    },
    {
      name: "Veggie Wrap",
      image: "https://images.unsplash.com/photo-1512621776951-5a62968f840f?w=400&h=300&fit=crop",
      reason: "Light but satisfying meal",
      healthScore: 86,
      healthySwap: "Choose whole wheat wrap for more fiber",
    },
  ],
  dinner: [
    {
      name: "Grilled Salmon with Vegetables",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
      reason: "Omega-3 rich meal to help you unwind",
      healthScore: 96,
      healthySwap: "Steam vegetables instead of roasting for fewer calories",
    },
    {
      name: "Chicken Stir-Fry",
      image: "https://images.unsplash.com/photo-1604908177076-0e5976a9b1d2?w=400&h=300&fit=crop",
      reason: "Balanced dinner for a restful evening",
      healthScore: 89,
      healthySwap: "Use less oil and more vegetables",
    },
    {
      name: "Lentil Curry",
      image: "https://images.unsplash.com/photo-1589308078055-869bb4134f03?w=400&h=300&fit=crop",
      reason: "Plant-based protein for better digestion",
      healthScore: 91,
      healthySwap: "Reduce coconut milk for lower fat content",
    },
  ],
};

export default function Meals() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  const handleOrderFood = (meal: any, platform: 'swiggy' | 'zomato') => {
    const searchQuery = encodeURIComponent(`${meal.name} ${meal.restaurant}`);
    const urls = {
      swiggy: `https://www.swiggy.com/search?query=${searchQuery}`,
      zomato: `https://www.zomato.com/search?q=${searchQuery}`
    };
    window.open(urls[platform], '_blank');
  };

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
  };
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
    <div
      className={cn(
        "relative min-h-screen overflow-hidden transition-colors",
        isDark ? "bg-[#0f1424] text-slate-100" : "bg-[#f3edff] text-slate-900"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-52 -left-32 h-[480px] w-[480px] rounded-full opacity-50 blur-[180px]",
          isDark ? "bg-[#1c2b55]" : "bg-[#b8c9ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[-160px] right-[-140px] h-[520px] w-[520px] rounded-full opacity-40 blur-[200px]",
          isDark ? "bg-[#123b46]" : "bg-[#8df5ff]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-slate-900 dark:text-slate-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100">Meals to Brighten Your Day</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Handpicked recipes and delivery ideas for every mood.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="breakfast" data-testid="tab-breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch" data-testid="tab-lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner" data-testid="tab-dinner">Dinner</TabsTrigger>
          </TabsList>
          
          {Object.entries(mockMeals).map(([category, meals]) => (
            <TabsContent key={category} value={category}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold capitalize mb-2 text-slate-800 dark:text-slate-100">
                  {category} Recommendations
                </h2>
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
