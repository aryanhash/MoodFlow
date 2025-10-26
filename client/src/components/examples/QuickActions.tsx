import QuickActions from '../QuickActions';

export default function QuickActionsExample() {
  return (
    <QuickActions
      onCheckMood={() => console.log('Check mood clicked')}
      onRegenerate={() => console.log('Regenerate clicked')}
      onBreathing={() => console.log('Breathing clicked')}
      onMealRecommendation={() => console.log('Meal recommendation clicked')}
    />
  );
}
