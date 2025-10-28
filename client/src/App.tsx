import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";

const STORAGE_KEY = "delegate-lens-tasks";

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: string;
  priority?: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Prepare quarterly board presentation",
    assignee: "Executive",
    status: "In Progress",
    priority: "Normal",
  },
  {
    id: "2",
    title: "Schedule vendor meeting for next week",
    assignee: "Assistant",
    status: "Done",
    priority: "Normal",
  },
  {
    id: "3",
    title: "Review and sign contract amendments",
    assignee: "Executive",
    status: "Blocked",
    priority: "Normal",
  },
];

const statusColorMap = {
  "In Progress": {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: Clock,
    iconColor: "text-slate-500",
  },
  Done: {
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    icon: CheckCircle2,
    iconColor: "text-slate-500",
  },
  Blocked: {
    badge: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [filter, setFilter] = useState("All");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "Executive",
    status: "In Progress",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }, [tasks]);

  const filteredTasks =
    filter === "All" ? tasks : tasks.filter((t: Task) => t.status === filter);

  const updateStatus = (id: string, newStatus: string) => {
    setTasks((prev: Task[]) =>
      prev.map((task: Task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee,
      status: newTask.status,
      priority: "Normal",
    };

    setTasks((prev) => [...prev, task]);
    setNewTask({ title: "", assignee: "Executive", status: "In Progress" });
    setShowNewTaskForm(false);
  };

  const counts = {
    total: tasks.length,
    "In Progress": tasks.filter((t: Task) => t.status === "In Progress").length,
    Done: tasks.filter((t: Task) => t.status === "Done").length,
    Blocked: tasks.filter((t: Task) => t.status === "Blocked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Delegate Lens
            </h1>
            <p className="text-sm text-muted-foreground">
              Track delegated tasks between executive and assistant
            </p>
          </div>
          <button
            data-testid="button-new-task"
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </header>

        {showNewTaskForm && (
          <div
            data-testid="form-new-task"
            className="mb-8 p-6 bg-muted/30 border border-border/50 rounded-lg"
          >
            <h3 className="text-sm font-medium text-foreground mb-4">
              Create New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-xs font-medium text-muted-foreground mb-2"
                >
                  Title
                </label>
                <input
                  id="task-title"
                  data-testid="input-task-title"
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="task-assignee"
                    className="block text-xs font-medium text-muted-foreground mb-2"
                  >
                    Assignee
                  </label>
                  <select
                    id="task-assignee"
                    data-testid="select-task-assignee"
                    value={newTask.assignee}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignee: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="task-status"
                    className="block text-xs font-medium text-muted-foreground mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="task-status"
                    data-testid="select-task-status"
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  data-testid="button-submit-task"
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Create Task
                </button>
                <button
                  data-testid="button-cancel-task"
                  type="button"
                  onClick={() => {
                    setShowNewTaskForm(false);
                    setNewTask({
                      title: "",
                      assignee: "Executive",
                      status: "In Progress",
                    });
                  }}
                  className="px-4 py-2 bg-background text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-8 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </span>
            <span className="text-sm font-semibold text-foreground">
              {counts.total}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In Progress
            </span>
            <span className="text-sm font-semibold text-foreground">
              {counts["In Progress"]}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Done
            </span>
            <span className="text-sm font-semibold text-foreground">
              {counts.Done}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Blocked
            </span>
            <span className="text-sm font-semibold text-foreground">
              {counts.Blocked}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {["All", "In Progress", "Done", "Blocked"].map((f) => (
            <button
              key={f}
              data-testid={`button-filter-${f.toLowerCase().replace(" ", "-")}`}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task: Task) => {
            const statusConfig =
              statusColorMap[task.status as keyof typeof statusColorMap];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={task.id}
                data-testid={`card-task-${task.id}`}
                className="bg-card border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <h2 className="text-base font-medium text-card-foreground mb-3">
                    {task.title}
                  </h2>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                      {task.assignee}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.badge}`}>
                      {task.status}
                    </span>
                  </div>

                  <select
                    data-testid={`select-status-${task.id}`}
                    value={task.status}
                    onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="text-xs border border-input bg-background rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
