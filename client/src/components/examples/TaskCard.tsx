import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="space-y-4">
      <TaskCard 
        id="1" 
        title="Morning meditation and journaling" 
        duration={15} 
        difficulty="easy"
        onToggle={(id) => console.log('Task toggled:', id)}
      />
      <TaskCard 
        id="2" 
        title="Review project requirements" 
        duration={30} 
        difficulty="medium"
        onToggle={(id) => console.log('Task toggled:', id)}
      />
      <TaskCard 
        id="3" 
        title="Deep work: Code new feature" 
        duration={90} 
        difficulty="hard"
        completed
        onToggle={(id) => console.log('Task toggled:', id)}
      />
    </div>
  );
}
