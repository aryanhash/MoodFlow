import BreathingExercise from '../BreathingExercise';

export default function BreathingExerciseExample() {
  return (
    <BreathingExercise
      duration={60}
      onComplete={() => console.log('Breathing exercise completed')}
    />
  );
}
