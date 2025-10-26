import RecommendationCard from '../RecommendationCard';
import { Music } from 'lucide-react';

export default function RecommendationCardExample() {
  return (
    <RecommendationCard
      icon={Music}
      title="Calm Playlists"
      category="Music"
      items={[
        "Peaceful Piano",
        "Ambient Relaxation",
        "Chill Vibes"
      ]}
      onItemClick={(item) => console.log('Clicked:', item)}
    />
  );
}
