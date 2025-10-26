import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

const sounds = [
  { id: "rain", name: "Rain Sounds", duration: "10:00" },
  { id: "ocean", name: "Ocean Waves", duration: "15:00" },
  { id: "forest", name: "Forest Ambience", duration: "12:00" },
  { id: "fire", name: "Crackling Fire", duration: "8:00" },
];

export default function AmbientSoundPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [volume, setVolume] = useState([70]);
  
  const currentSound = sounds.find((s) => s.id === selectedSound);
  
  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-accent font-semibold mb-2">Ambient Sounds</h2>
          <p className="text-muted-foreground">Create a peaceful environment</p>
        </div>
        
        <div className="flex items-center justify-center h-32">
          <div className="flex gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all ${
                  isPlaying ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${isPlaying ? Math.random() * 80 + 20 : 30}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Sound</label>
            <Select value={selectedSound} onValueChange={setSelectedSound}>
              <SelectTrigger data-testid="select-sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sounds.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Volume: {volume[0]}%
            </label>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              data-testid="slider-volume"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Duration: {currentSound?.duration}
            </span>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="lg"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
