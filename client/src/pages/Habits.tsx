import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Check, CheckCircle } from "lucide-react";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

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

export default function Habits() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('dailyHabits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('dailyHabits', JSON.stringify(habits));
  }, [habits]);

  const toggleExercise = () => {
    setHabits(prev => ({ ...prev, exercise: !prev.exercise }));
  };

  const setWaterGlasses = (glasses: number) => {
    setHabits(prev => ({ ...prev, waterGlasses: glasses }));
  };

  const setScreenTime = (time: number[]) => {
    setHabits(prev => ({ ...prev, screenTime: time[0] }));
  };

  const toggleMeal = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    setHabits(prev => ({
      ...prev,
      meals: { ...prev.meals, [meal]: !prev.meals[meal] }
    }));
  };

  const getCompletedMeals = () => {
    return Object.values(habits.meals).filter(Boolean).length;
  };

  const getTotalMeals = () => {
    return Object.keys(habits.meals).length;
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
          "pointer-events-none absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full opacity-50 blur-[150px]",
          isDark ? "bg-[#1c2b55]" : "bg-[#9dbbff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[-160px] right-[-120px] h-[460px] w-[460px] rounded-full opacity-40 blur-[170px]",
          isDark ? "bg-[#123b46]" : "bg-[#8df5ff]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-slate-900 dark:text-slate-100">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100">Daily Habits Tracker</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Keep tabs on the routines that keep you grounded.</p>
        </div>
        <div className="space-y-6">
          {/* Exercise Today Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg dark:bg-slate-900/70 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-slate-100">Exercise Today</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">Track your daily physical activity</p>
              </div>
              <button
                onClick={toggleExercise}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  habits.exercise
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50 dark:border-slate-600 dark:hover:bg-slate-700'
                }`}
              >
                {habits.exercise && <Check className="w-6 h-6" />}
              </button>
            </div>
          </Card>

          {/* Water Intake Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg dark:bg-slate-900/70 dark:border-slate-800/60">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Water Intake (glasses)</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">Select the number of glasses you've consumed</p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((glass) => (
                  <button
                    key={glass}
                    onClick={() => setWaterGlasses(glass)}
                    className={`w-12 h-12 rounded-lg font-semibold transition-all duration-200 ${
                      habits.waterGlasses >= glass
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {glass}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                Target: 8 glasses • Current: {habits.waterGlasses} glasses
              </p>
            </div>
          </Card>

          {/* Screen Time Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg dark:bg-slate-900/70 dark:border-slate-800/60">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Screen Time (hours)</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">Track your daily screen usage</p>
              <div className="px-2">
                <Slider
                  value={[habits.screenTime]}
                  onValueChange={setScreenTime}
                  max={12}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-center mt-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {habits.screenTime}h
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                Recommended: 2-4 hours • Current: {habits.screenTime} hours
              </p>
            </div>
          </Card>

          {/* Meals Today Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg dark:bg-slate-900/70 dark:border-slate-800/60">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">Meals Today</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">Mark the meals you've completed</p>
              <div className="space-y-3">
                {[
                  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
                  { key: 'lunch', label: 'Lunch', icon: '☀️' },
                  { key: 'dinner', label: 'Dinner', icon: '🌙' }
                ].map((meal) => (
                  <div
                    key={meal.key}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      habits.meals[meal.key as keyof typeof habits.meals]
                        ? 'bg-green-50 border-green-300 dark:bg-slate-800 dark:border-green-400/60'
                        : 'bg-gray-50 border-gray-200 hover:border-green-300 hover:bg-green-50 dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-700/70'
                    }`}
                    onClick={() => toggleMeal(meal.key as 'breakfast' | 'lunch' | 'dinner')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{meal.label}</span>
                      </div>
                      {habits.meals[meal.key as keyof typeof habits.meals] && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-4">
                Progress: {getCompletedMeals()}/{getTotalMeals()} meals completed
              </p>
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg dark:from-[#6f58ff] dark:to-[#c149ff]">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Today's Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{habits.exercise ? '✅' : '❌'}</div>
                  <div className="text-sm opacity-90">Exercise</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{habits.waterGlasses}/8</div>
                  <div className="text-sm opacity-90">Water</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{habits.screenTime}h</div>
                  <div className="text-sm opacity-90">Screen Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{getCompletedMeals()}/3</div>
                  <div className="text-sm opacity-90">Meals</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
