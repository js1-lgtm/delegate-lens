import TaskCard from '../TaskCard';

export default function TaskCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <TaskCard
        task={{
          id: "1",
          title: "Review quarterly budget report",
          assignee: "Executive",
          status: "In Progress"
        }}
        onEdit={(task) => console.log('Edit task:', task)}
        onDelete={(id) => console.log('Delete task:', id)}
      />
      
      <TaskCard
        task={{
          id: "2",
          title: "Schedule team meeting for next week",
          assignee: "Assistant",
          status: "Done"
        }}
        onEdit={(task) => console.log('Edit task:', task)}
        onDelete={(id) => console.log('Delete task:', id)}
      />
      
      <TaskCard
        task={{
          id: "3",
          title: "Finalize contract with new vendor",
          assignee: "Executive",
          status: "Blocked"
        }}
        onEdit={(task) => console.log('Edit task:', task)}
        onDelete={(id) => console.log('Delete task:', id)}
      />
    </div>
  );
}
