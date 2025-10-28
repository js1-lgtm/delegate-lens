import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import FilterBar from "@/components/FilterBar";
import EmptyState from "@/components/EmptyState";
import { localStorageUtils } from "@/lib/localStorage";
import type { Task, InsertTask, TaskAssignee, TaskStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedAssignee, setSelectedAssignee] = useState<TaskAssignee | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "All">("All");
  const { toast } = useToast();

  useEffect(() => {
    const storedTasks = localStorageUtils.getTasks();
    setTasks(storedTasks);
  }, []);

  const handleCreateTask = (taskData: InsertTask) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
    };
    
    localStorageUtils.addTask(newTask);
    setTasks([...tasks, newTask]);
    
    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    });
  };

  const handleUpdateTask = (taskData: InsertTask) => {
    if (!editingTask) return;
    
    const updatedTask: Task = {
      ...taskData,
      id: editingTask.id,
    };
    
    localStorageUtils.updateTask(editingTask.id, updatedTask);
    setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
    setEditingTask(undefined);
    
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const handleDeleteTask = (id: string) => {
    localStorageUtils.deleteTask(id);
    setTasks(tasks.filter((t) => t.id !== id));
    
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const filteredTasks = tasks.filter((task) => {
    const assigneeMatch = selectedAssignee === "All" || task.assignee === selectedAssignee;
    const statusMatch = selectedStatus === "All" || task.status === selectedStatus;
    return assigneeMatch && statusMatch;
  });

  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Done").length,
    blocked: tasks.filter((t) => t.status === "Blocked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-page-title">
                Delegate Lens
              </h1>
              <p className="text-sm text-muted-foreground">
                Track delegated tasks between executive and assistant
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm">
                <div className="text-center" data-testid="stat-total">
                  <div className="font-medium text-foreground">{taskStats.total}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="text-center" data-testid="stat-in-progress">
                  <div className="font-medium text-foreground">{taskStats.inProgress}</div>
                  <div className="text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center" data-testid="stat-done">
                  <div className="font-medium text-foreground">{taskStats.done}</div>
                  <div className="text-muted-foreground">Done</div>
                </div>
                <div className="text-center" data-testid="stat-blocked">
                  <div className="font-medium text-foreground">{taskStats.blocked}</div>
                  <div className="text-muted-foreground">Blocked</div>
                </div>
              </div>
              
              <Button onClick={() => setIsFormOpen(true)} data-testid="button-new-task">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-8">
          <FilterBar
            selectedAssignee={selectedAssignee}
            selectedStatus={selectedStatus}
            onAssigneeChange={setSelectedAssignee}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <EmptyState onCreateTask={() => setIsFormOpen(true)} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground" data-testid="text-no-results">
                No tasks match the selected filters.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-tasks">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        <TaskForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
        />
      </div>
    </div>
  );
}
