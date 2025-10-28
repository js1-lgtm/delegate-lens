import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const STORAGE_KEY = "delegate-lens-tasks";

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Prepare quarterly board presentation",
    assignee: "Executive",
    status: "In Progress",
  },
  {
    id: "2",
    title: "Schedule vendor meeting for next week",
    assignee: "Assistant",
    status: "Done",
  },
  {
    id: "3",
    title: "Review and sign contract amendments",
    assignee: "Executive",
    status: "Blocked",
  },
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialTasks;
    } catch {
      return initialTasks;
    }
  });
  
  const [filter, setFilter] = useState("All");

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

  const counts = {
    total: tasks.length,
    "In Progress": tasks.filter((t: Task) => t.status === "In Progress").length,
    Done: tasks.filter((t: Task) => t.status === "Done").length,
    Blocked: tasks.filter((t: Task) => t.status === "Blocked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Delegate Lens
          </h1>
          <p className="text-sm text-muted-foreground">
            Track delegated tasks between executive and assistant
          </p>
        </header>

        <div className="mb-8 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </span>
            <span className="text-base font-semibold text-foreground">
              {counts.total}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In Progress
            </span>
            <span className="text-base font-semibold text-foreground">
              {counts["In Progress"]}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Done
            </span>
            <span className="text-base font-semibold text-foreground">
              {counts.Done}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-lg">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Blocked
            </span>
            <span className="text-base font-semibold text-foreground">
              {counts.Blocked}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {["All", "In Progress", "Done", "Blocked"].map((f) => (
            <button
              key={f}
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
          {filteredTasks.map((task: Task) => (
            <div
              key={task.id}
              className="bg-card border border-card-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h2 className="text-base font-medium text-card-foreground mb-3">
                  {task.title}
                </h2>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    {task.assignee}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  {task.status === "Done" && (
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  )}
                  {task.status === "In Progress" && (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  {task.status === "Blocked" && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      task.status === "Done"
                        ? "bg-muted text-muted-foreground"
                        : task.status === "In Progress"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  className="text-xs border border-input bg-background rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>In Progress</option>
                  <option>Done</option>
                  <option>Blocked</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
