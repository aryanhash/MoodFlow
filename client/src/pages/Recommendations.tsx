import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Play, Eye, BookOpen, Video } from "lucide-react";
import { MoodType } from "@shared/schema";
import TopNav from "@/components/TopNav";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// Enhanced mood-based recommendations with images and better structure
const getMoodRecommendations = (mood: MoodType) => {
  const recommendations = {
    energized: {
      exercises: [
        {
          title: "Morning Stretch",
          subtitle: "Energizing",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "10-Min Cardio",
          subtitle: "High-Intensity",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Dance Workout",
          subtitle: "Fun & Active",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      music: [
        {
          title: "Deep Focus Beats",
          subtitle: "Lofi Hip-Hop",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Uplifting Pop Hits",
          subtitle: "Pop",
          image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Workout Energy",
          subtitle: "Electronic",
          image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      watch: [
        {
          title: "Cosmic Odyssey",
          subtitle: "Sci-Fi",
          image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        },
        {
          title: "The Whispering Woods",
          subtitle: "Fantasy Book",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&crop=center",
          action: "Read",
          icon: BookOpen
        },
        {
          title: "Adventure Quest",
          subtitle: "Documentary",
          image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        }
      ],
      cooking: [
        {
          title: "Quick & Healthy Lunch",
          subtitle: "15 min video",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Comfort Food",
          subtitle: "30 min video",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Energy Smoothie",
          subtitle: "5 min video",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        }
      ]
    },
    calm: {
      exercises: [
        {
          title: "Gentle Yoga Flow",
          subtitle: "Relaxing",
          image: "https://images.unsplash.com/photo-1506629905607-1b5a7a0b5b5b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Breathing Exercises",
          subtitle: "Meditation",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Nature Walk",
          subtitle: "Mindful",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      music: [
        {
          title: "Peaceful Piano",
          subtitle: "Classical",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Ambient Nature",
          subtitle: "Relaxing",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Meditation Sounds",
          subtitle: "Zen",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      watch: [
        {
          title: "Serene Landscapes",
          subtitle: "Nature",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        },
        {
          title: "Mindful Reading",
          subtitle: "Philosophy",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center",
          action: "Read",
          icon: BookOpen
        },
        {
          title: "Peaceful Stories",
          subtitle: "Inspiration",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        }
      ],
      cooking: [
        {
          title: "Herbal Tea & Oatmeal",
          subtitle: "10 min video",
          image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Mediterranean Bowl",
          subtitle: "20 min video",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Lavender Smoothie",
          subtitle: "5 min video",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        }
      ]
    },
    stressed: {
      exercises: [
        {
          title: "Stress Relief Yoga",
          subtitle: "Calming",
          image: "https://images.unsplash.com/photo-1506629905607-1b5a7a0b5b5b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Deep Breathing",
          subtitle: "Relaxation",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Gentle Stretches",
          subtitle: "Soothing",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      music: [
        {
          title: "Calming Classical",
          subtitle: "Relaxing",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Soft Instrumentals",
          subtitle: "Peaceful",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Nature Sounds",
          subtitle: "Ambient",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      watch: [
        {
          title: "Comfort Films",
          subtitle: "Feel-Good",
          image: "https://images.unsplash.com/photo-1489599803002-4a2b4b4b4b4b?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        },
        {
          title: "Inspirational Stories",
          subtitle: "Motivation",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center",
          action: "Read",
          icon: BookOpen
        },
        {
          title: "Peaceful Documentaries",
          subtitle: "Nature",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        }
      ],
      cooking: [
        {
          title: "Comfort Soup",
          subtitle: "25 min video",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Warm Milk & Toast",
          subtitle: "5 min video",
          image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Chamomile Smoothie",
          subtitle: "3 min video",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        }
      ]
    },
    focused: {
      exercises: [
        {
          title: "Tai Chi Flow",
          subtitle: "Mindful",
          image: "https://images.unsplash.com/photo-1506629905607-1b5a7a0b5b5b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Balance Exercises",
          subtitle: "Concentration",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Focus Yoga",
          subtitle: "Centering",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      music: [
        {
          title: "Binaural Beats",
          subtitle: "Focus",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Classical Focus",
          subtitle: "Concentration",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Ambient Study",
          subtitle: "Productive",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      watch: [
        {
          title: "Educational Content",
          subtitle: "Learning",
          image: "https://images.unsplash.com/photo-1489599803002-4a2b4b4b4b4b?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        },
        {
          title: "Deep Work Guide",
          subtitle: "Productivity",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center",
          action: "Read",
          icon: BookOpen
        },
        {
          title: "Mind-Bending Films",
          subtitle: "Intellectual",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        }
      ],
      cooking: [
        {
          title: "Brain-Boosting Salad",
          subtitle: "15 min video",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Matcha Energy Bowl",
          subtitle: "10 min video",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Focus Smoothie",
          subtitle: "5 min video",
          image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        }
      ]
    },
    neutral: {
      exercises: [
        {
          title: "Moderate Cardio",
          subtitle: "Balanced",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Yoga Flow",
          subtitle: "Versatile",
          image: "https://images.unsplash.com/photo-1506629905607-1b5a7a0b5b5b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Strength Training",
          subtitle: "Fitness",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      music: [
        {
          title: "Mixed Genres",
          subtitle: "Popular",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Indie Favorites",
          subtitle: "Alternative",
          image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        },
        {
          title: "Classic Rock",
          subtitle: "Timeless",
          image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop&crop=center",
          action: "Play",
          icon: Play
        }
      ],
      watch: [
        {
          title: "Recent Releases",
          subtitle: "Popular",
          image: "https://images.unsplash.com/photo-1489599803002-4a2b4b4b4b4b?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        },
        {
          title: "Contemporary Fiction",
          subtitle: "Books",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center",
          action: "Read",
          icon: BookOpen
        },
        {
          title: "Award Winners",
          subtitle: "Entertainment",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center",
          action: "View",
          icon: Eye
        }
      ],
      cooking: [
        {
          title: "Balanced Buddha Bowl",
          subtitle: "20 min video",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Classic Avocado Toast",
          subtitle: "10 min video",
          image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        },
        {
          title: "Mixed Berry Smoothie",
          subtitle: "5 min video",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7d1e8d6?w=300&h=200&fit=crop&crop=center",
          action: "Watch",
          icon: Video
        }
      ]
    }
  };
  
  return recommendations[mood] || recommendations.neutral;
};

export default function Recommendations() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentMood, setCurrentMood] = useState<MoodType>("neutral");
  
  // Fetch latest mood
  const { data: latestMood } = useQuery({
    queryKey: ["/api/mood/latest"],
    queryFn: async () => {
      const res = await fetch("/api/mood/latest?userId=default");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch mood");
      return res.json();
    },
  });
  
  useEffect(() => {
    if (latestMood) {
      setCurrentMood(latestMood.mood);
    }
  }, [latestMood]);
  
  const moodRecommendations = getMoodRecommendations(currentMood);
  
  const getMoodMessage = (mood: MoodType) => {
    const messages = {
      energized: "Feeling Energetic? Here's a Boost.",
      calm: "Need Some Peace? Here's Your Calm.",
      stressed: "Feeling Stressed? Let's Find Relief.",
      focused: "Need Focus? Here's Your Concentration.",
      neutral: "Looking for Something? Here's Variety."
    };
    return messages[mood] || messages.neutral;
  };
  
  const handleItemClick = (item: any) => {
    console.log("Recommendation clicked:", item.title);
    
    // Handle different types of recommendations
    if (item.action === "Play") {
      // For music/exercises, open Spotify or YouTube
      if (item.subtitle.includes("Hip-Hop") || item.subtitle.includes("Pop") || item.subtitle.includes("Electronic")) {
        window.open("https://open.spotify.com/search/" + encodeURIComponent(item.title), '_blank');
      } else {
        window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(item.title), '_blank');
      }
    } else if (item.action === "View") {
      // For videos/content, open YouTube or Netflix
      window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(item.title), '_blank');
    } else if (item.action === "Read") {
      // For books, open Goodreads or Amazon
      window.open("https://www.goodreads.com/search?q=" + encodeURIComponent(item.title), '_blank');
    } else if (item.action === "Watch") {
      // For cooking videos, open YouTube
      window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(item.title + " recipe"), '_blank');
    }
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
          "pointer-events-none absolute -top-48 -left-20 h-[520px] w-[520px] rounded-full opacity-45 blur-[200px]",
          isDark ? "bg-[#222f5c]" : "bg-[#c4d2ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[-180px] right-[-160px] h-[520px] w-[520px] rounded-full opacity-40 blur-[220px]",
          isDark ? "bg-[#123b46]" : "bg-[#8df5ff]"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[220px]",
          isDark ? "bg-[#3a1f55]" : "bg-[#ffd4f5]"
        )}
      />

      <TopNav />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-20 text-slate-900 dark:text-slate-100">
        <div className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            <Sparkles className="h-4 w-4 text-[#7d5bff]" />
            For You
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">Personalized Inspirations</h1>
          <p className="mt-3 text-sm text-slate-500">{getMoodMessage(currentMood)}</p>
        </div>

        <div className="space-y-10">
          <section>
            <div className="mb-4 text-left">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Quick Exercises</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">Short bursts of movement to match your current energy.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {moodRecommendations.exercises.map((item, index) => (
                <div
                  key={index}
                  className="flex w-64 shrink-0 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => handleItemClick(item)}
                  role="button"
                >
                  <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div>
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{item.subtitle}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full bg-[#7d5bff] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110">
                      <item.icon className="h-4 w-4" />
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 text-left">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Tune In</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">Playlists and sounds to elevate your vibe.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {moodRecommendations.music.map((item, index) => (
                <div
                  key={index}
                  className="flex w-64 shrink-0 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => handleItemClick(item)}
                  role="button"
                >
                  <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div>
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{item.subtitle}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full bg-[#3a7bff] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110">
                      <item.icon className="h-4 w-4" />
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 text-left">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Watch Next</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">Films, stories, and documentaries to unwind with.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {moodRecommendations.watch.map((item, index) => (
                <div
                  key={index}
                  className="flex w-64 shrink-0 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => handleItemClick(item)}
                  role="button"
                >
                  <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div>
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{item.subtitle}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full bg-[#7d5bff] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110">
                      <item.icon className="h-4 w-4" />
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 text-left">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Get Cooking</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">Mood-matching recipes ready in minutes.</p>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {moodRecommendations.cooking.map((item, index) => (
                <div
                  key={index}
                  className="flex w-64 shrink-0 flex-col overflow-hidden rounded-3xl bg-white/80 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
                  onClick={() => handleItemClick(item)}
                  role="button"
                >
                  <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div>
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{item.subtitle}</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full bg-[#25c2a0] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110">
                      <item.icon className="h-4 w-4" />
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
