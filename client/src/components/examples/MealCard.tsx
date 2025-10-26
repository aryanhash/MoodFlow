import MealCard from '../MealCard';
import breakfastImage from '@assets/generated_images/Healthy_breakfast_avocado_toast_b085d880.png';

export default function MealCardExample() {
  return (
    <MealCard
      name="Avocado Toast with Poached Eggs"
      image={breakfastImage}
      category="breakfast"
      reason="Perfect energizing breakfast for your calm mood"
      healthScore={92}
      healthySwap="Use whole grain bread instead of white bread"
      onOrder={() => console.log('Order clicked')}
      onCook={() => console.log('Cook clicked')}
    />
  );
}
