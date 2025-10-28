import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, Clock, AlertCircle, Plus, Focus, Activity } from "lucide-react";

const STORAGE_KEY = "delegate-lens-tasks";
const FOCUS_MODE_KEY = "delegate-lens-focus-mode";
const TRACE_KEY = "delegate-lens-trace-data";
const TRACE_VISIBLE_KEY = "delegate-lens-trace-visible";
const INSIGHT_KEY = "delegate-lens-insight-data";
const INSIGHT_VISIBLE_KEY = "delegate-lens-insight-visible";
const HISTORY_VISIBLE_KEY = "delegate-lens-history-visible";
const PRESENTATION_MODE_KEY = "delegate-lens-presentation-mode";
const FILTER_KEY = "delegate-lens-filter";

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: string;
  priority?: string;
  lastUpdated?: string;
  contextSwitchCount?: number;
  focusActiveDuringUpdate?: boolean;
  history?: { date: string; oldStatus: string; newStatus: string }[];
};

type TraceData = {
  tasksUpdatedToday: number;
  lastTraceDate: string;
};

type InsightData = {
  topSwitchTasks: string[];
  mostRecentTask: string;
  contextSwitchTotal: number;
  generatedAt: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Prepare quarterly board presentation",
    assignee: "Executive",
    status: "In Progress",
    priority: "High",
    lastUpdated: new Date().toISOString(),
    contextSwitchCount: 0,
    history: [],
  },
  {
    id: "2",
    title: "Schedule vendor meeting for next week",
    assignee: "Assistant",
    status: "Done",
    priority: "Normal",
    lastUpdated: new Date().toISOString(),
    contextSwitchCount: 0,
    history: [],
  },
  {
    id: "3",
    title: "Review and sign contract amendments",
    assignee: "Executive",
    status: "Blocked",
    priority: "Normal",
    lastUpdated: new Date().toISOString(),
    contextSwitchCount: 0,
    history: [],
  },
];

const statusColorMap = {
  "In Progress": {
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: Clock,
    iconColor: "text-slate-500",
  },
  Done: {
    badge: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
    icon: CheckCircle2,
    iconColor: "text-green-500",
  },
  Blocked: {
    badge: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
};

const priorityConfig = {
  High: {
    dot: "bg-red-500",
    label: "text-red-600",
  },
  Normal: {
    dot: "bg-slate-400",
    label: "text-slate-600",
  },
  Low: {
    dot: "bg-blue-500",
    label: "text-blue-600",
  },
};

function getRelativeTime(isoDate?: string): string {
  if (!isoDate) return "Recently";
  
  const now = new Date();
  const updated = new Date(isoDate);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return diffDays === 1 ? "Updated 1 day ago" : `Updated ${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? "Updated 1 hour ago" : `Updated ${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? "Updated 1 minute ago" : `Updated ${diffMinutes} minutes ago`;
  } else {
    return "Updated just now";
  }
}

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function formatHistoryDate(isoDate: string): string {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

function isDataOlderThan7Days(isoDate: string): boolean {
  const dataDate = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - dataDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 7;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : initialTasks;
      // Filter malformed tasks on mount
      return parsed.filter((t: Task) => t.id && t.title);
    } catch {
      return initialTasks;
    }
  });

  const [filter, setFilter] = useState(() => {
    try {
      const stored = localStorage.getItem(FILTER_KEY);
      return stored || "All";
    } catch {
      return "All";
    }
  });
  const [focusMode, setFocusMode] = useState(() => {
    try {
      const stored = localStorage.getItem(FOCUS_MODE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [traceData, setTraceData] = useState<TraceData>(() => {
    try {
      const stored = localStorage.getItem(TRACE_KEY);
      const data = stored ? JSON.parse(stored) : { tasksUpdatedToday: 0, lastTraceDate: getTodayDateString() };
      
      // Daily reset logic
      const today = getTodayDateString();
      if (data.lastTraceDate !== today) {
        return { tasksUpdatedToday: 0, lastTraceDate: today };
      }
      
      // Clear if older than 7 days
      if (isDataOlderThan7Days(data.lastTraceDate)) {
        return { tasksUpdatedToday: 0, lastTraceDate: today };
      }
      
      return data;
    } catch {
      return { tasksUpdatedToday: 0, lastTraceDate: getTodayDateString() };
    }
  });

  const [traceVisible, setTraceVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(TRACE_VISIBLE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [insightVisible, setInsightVisible] = useState(() => {
    try {
      const stored = localStorage.getItem(INSIGHT_VISIBLE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [insightData, setInsightData] = useState<InsightData | null>(() => {
    try {
      const stored = localStorage.getItem(INSIGHT_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Clear if older than 7 days
      if (data.generatedAt && isDataOlderThan7Days(data.generatedAt)) {
        localStorage.removeItem(INSIGHT_KEY);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  });

  const [historyVisible, setHistoryVisible] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_VISIBLE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [presentationMode, setPresentationMode] = useState(() => {
    try {
      const stored = localStorage.getItem(PRESENTATION_MODE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "Executive",
    status: "In Progress",
    priority: "Normal",
  });
  const [titleError, setTitleError] = useState("");

  const insightOverlayRef = useRef<HTMLDivElement>(null);

  // Debounced localStorage save functions
  const debouncedSaveTasks = useCallback(
    debounce((tasks: Task[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveTraceData = useCallback(
    debounce((data: TraceData) => {
      try {
        localStorage.setItem(TRACE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save trace data:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveHistoryVisible = useCallback(
    debounce((visible: Record<string, boolean>) => {
      try {
        localStorage.setItem(HISTORY_VISIBLE_KEY, JSON.stringify(visible));
      } catch (error) {
        console.error("Failed to save history visibility:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveFilter = useCallback(
    debounce((filter: string) => {
      try {
        localStorage.setItem(FILTER_KEY, filter);
      } catch (error) {
        console.error("Failed to save filter:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveFocusMode = useCallback(
    debounce((mode: boolean) => {
      try {
        localStorage.setItem(FOCUS_MODE_KEY, mode.toString());
      } catch (error) {
        console.error("Failed to save focus mode:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveTraceVisible = useCallback(
    debounce((visible: boolean) => {
      try {
        localStorage.setItem(TRACE_VISIBLE_KEY, visible.toString());
      } catch (error) {
        console.error("Failed to save trace visibility:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveInsightVisible = useCallback(
    debounce((visible: boolean) => {
      try {
        localStorage.setItem(INSIGHT_VISIBLE_KEY, visible.toString());
      } catch (error) {
        console.error("Failed to save insight visibility:", error);
      }
    }, 150),
    []
  );

  const debouncedSavePresentationMode = useCallback(
    debounce((mode: boolean) => {
      try {
        localStorage.setItem(PRESENTATION_MODE_KEY, mode.toString());
      } catch (error) {
        console.error("Failed to save presentation mode:", error);
      }
    }, 150),
    []
  );

  const debouncedSaveInsightData = useCallback(
    debounce((data: InsightData) => {
      try {
        localStorage.setItem(INSIGHT_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save insight data:", error);
      }
    }, 150),
    []
  );

  useEffect(() => {
    debouncedSaveTasks(tasks);
  }, [tasks, debouncedSaveTasks]);

  useEffect(() => {
    debouncedSaveFilter(filter);
  }, [filter, debouncedSaveFilter]);

  useEffect(() => {
    debouncedSaveFocusMode(focusMode);
  }, [focusMode, debouncedSaveFocusMode]);

  useEffect(() => {
    debouncedSaveTraceData(traceData);
  }, [traceData, debouncedSaveTraceData]);

  useEffect(() => {
    debouncedSaveTraceVisible(traceVisible);
  }, [traceVisible, debouncedSaveTraceVisible]);

  useEffect(() => {
    debouncedSaveInsightVisible(insightVisible);
  }, [insightVisible, debouncedSaveInsightVisible]);

  useEffect(() => {
    debouncedSaveHistoryVisible(historyVisible);
  }, [historyVisible, debouncedSaveHistoryVisible]);

  useEffect(() => {
    debouncedSavePresentationMode(presentationMode);
  }, [presentationMode, debouncedSavePresentationMode]);

  useEffect(() => {
    if (insightData) {
      debouncedSaveInsightData(insightData);
    }
  }, [insightData, debouncedSaveInsightData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (presentationMode) {
          setPresentationMode(false);
        } else if (insightVisible) {
          setInsightVisible(false);
        } else if (traceVisible) {
          setTraceVisible(false);
        }
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [traceVisible, insightVisible, presentationMode]);

  // Focus trap for insight overlay
  useEffect(() => {
    if (insightVisible && insightOverlayRef.current) {
      const overlay = insightOverlayRef.current;
      const focusableElements = overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      overlay.addEventListener("keydown", handleTab as any);
      firstElement?.focus();

      return () => {
        overlay.removeEventListener("keydown", handleTab as any);
      };
    }
  }, [insightVisible]);

  const filteredTasks =
    filter === "All" ? tasks : tasks.filter((t: Task) => t.status === filter);

  const updateStatus = (id: string, newStatus: string) => {
    setTasks((prev: Task[]) =>
      prev.map((task: Task) => {
        if (task.id === id) {
          const oldStatus = task.status;
          const historyEntry = {
            date: new Date().toISOString(),
            oldStatus,
            newStatus,
          };
          
          return {
            ...task,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            contextSwitchCount: (task.contextSwitchCount || 0) + 1,
            focusActiveDuringUpdate: focusMode,
            history: [...(task.history || []), historyEntry],
          };
        }
        return task;
      })
    );
    
    // Increment tasks updated today
    setTraceData((prev) => {
      const today = getTodayDateString();
      if (prev.lastTraceDate !== today) {
        return { tasksUpdatedToday: 1, lastTraceDate: today };
      }
      return { ...prev, tasksUpdatedToday: prev.tasksUpdatedToday + 1 };
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setTitleError("Task title is required");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee,
      status: newTask.status,
      priority: newTask.priority,
      lastUpdated: new Date().toISOString(),
      contextSwitchCount: 0,
      history: [],
    };

    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: "",
      assignee: "Executive",
      status: "In Progress",
      priority: "Normal",
    });
    setTitleError("");
    setShowNewTaskForm(false);
  };

  const toggleFocusMode = () => {
    setFocusMode((prev) => !prev);
  };

  const toggleTrace = () => {
    setTraceVisible((prev) => !prev);
  };

  const toggleInsight = () => {
    if (!insightVisible) {
      // Generate insight data when opening
      const sortedBySwitch = [...tasks].sort(
        (a, b) => (b.contextSwitchCount || 0) - (a.contextSwitchCount || 0)
      );
      const topThree = sortedBySwitch.slice(0, 3).map((t) => t.title);
      
      const mostRecent = [...tasks].sort(
        (a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
      )[0];

      const totalSwitches = tasks.reduce((sum, t) => sum + (t.contextSwitchCount || 0), 0);

      setInsightData({
        topSwitchTasks: topThree,
        mostRecentTask: mostRecent?.title || "None",
        contextSwitchTotal: totalSwitches,
        generatedAt: new Date().toISOString(),
      });
    }
    setInsightVisible((prev) => !prev);
  };

  const toggleHistory = (taskId: string) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const togglePresentationMode = () => {
    setPresentationMode((prev) => !prev);
    // Auto-show trace in presentation mode
    if (!presentationMode) {
      setTraceVisible(true);
    }
  };

  const counts = {
    total: tasks.length,
    "In Progress": tasks.filter((t: Task) => t.status === "In Progress").length,
    Done: tasks.filter((t: Task) => t.status === "Done").length,
    Blocked: tasks.filter((t: Task) => t.status === "Blocked").length,
  };

  // Cognitive Trace Metrics
  const avgContextSwitch = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + (t.contextSwitchCount || 0), 0) / tasks.length)
    : 0;
  
  const focusUpdates = tasks.filter((t) => t.focusActiveDuringUpdate === true).length;

  // Generate fresh insight data for presentation mode
  useEffect(() => {
    if (presentationMode && !insightData) {
      const sortedBySwitch = [...tasks].sort(
        (a, b) => (b.contextSwitchCount || 0) - (a.contextSwitchCount || 0)
      );
      const topThree = sortedBySwitch.slice(0, 3).map((t) => t.title);
      
      const mostRecent = [...tasks].sort(
        (a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
      )[0];

      const totalSwitches = tasks.reduce((sum, t) => sum + (t.contextSwitchCount || 0), 0);

      setInsightData({
        topSwitchTasks: topThree,
        mostRecentTask: mostRecent?.title || "None",
        contextSwitchTotal: totalSwitches,
        generatedAt: new Date().toISOString(),
      });
    }
  }, [presentationMode, tasks, insightData]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className={`flex items-start justify-between ${presentationMode ? 'mb-6' : 'mb-8'}`}>
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">
              {presentationMode ? 'Delegate Lens · Executive Overview' : 'Delegate Lens'}
            </h1>
            {!presentationMode && (
              <p className="text-sm text-muted-foreground/80">
                Track delegated tasks between executive and assistant
              </p>
            )}
          </div>
          {!presentationMode && (
            <div className="flex items-center gap-2">
              <button
                data-testid="button-present"
                onClick={togglePresentationMode}
                className="flex items-center gap-2 px-4 py-2 bg-background text-foreground border border-border/30 rounded-lg text-sm font-medium hover:bg-muted transition-all duration-200 ease-out"
                aria-label="Enter presentation mode"
                aria-pressed={presentationMode}
              >
                <CheckCircle2 className="w-4 h-4" />
                Present
              </button>
              <button
                data-testid="button-insight"
                onClick={toggleInsight}
                className="flex items-center gap-2 px-4 py-2 bg-background text-foreground border border-border/30 rounded-lg text-sm font-medium hover:bg-muted transition-all duration-200 ease-out"
                aria-label={insightVisible ? "Close insight overlay" : "Open insight overlay"}
                aria-controls="insight-overlay"
                aria-expanded={insightVisible}
              >
                <Activity className="w-4 h-4" />
                Insight
              </button>
              <button
                data-testid="button-focus-mode"
                onClick={toggleFocusMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border/30 transition-all duration-200 ease-out ${
                  focusMode
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
                aria-pressed={focusMode}
              >
                <Focus className="w-4 h-4" />
                Focus
              </button>
              <button
                data-testid="button-new-task"
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-all duration-200 ease-out"
                aria-label="Create new task"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
          )}
          {presentationMode && (
            <button
              data-testid="button-exit-presentation"
              onClick={togglePresentationMode}
              className="px-4 py-2 bg-background text-foreground border border-border/30 rounded-lg text-sm font-medium opacity-90 transition-all duration-200 ease-out"
              aria-label="Exit presentation mode"
              aria-pressed={presentationMode}
            >
              Exit Presentation
            </button>
          )}
        </header>

        {focusMode && !presentationMode && (
          <div
            data-testid="banner-focus-mode"
            className="mb-6 text-center py-2 px-4 bg-muted rounded-lg"
          >
            <span className="text-xs text-muted-foreground">
              Focus Mode Active
            </span>
          </div>
        )}

        {showNewTaskForm && !presentationMode && (
          <div
            data-testid="form-new-task"
            className="mb-6 p-6 bg-muted/30 border border-border/30 rounded-lg"
          >
            <h3 className="text-sm font-medium text-foreground mb-3">
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
                  onChange={(e) => {
                    setNewTask({ ...newTask, title: e.target.value });
                    if (titleError) setTitleError("");
                  }}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  placeholder="Enter task title..."
                  aria-required="true"
                  aria-invalid={titleError ? "true" : "false"}
                  aria-describedby={titleError ? "title-error" : undefined}
                  autoFocus
                />
                {titleError && (
                  <p 
                    id="title-error" 
                    role="alert" 
                    className="text-xs text-red-600 dark:text-red-400 mt-1"
                    data-testid="error-title"
                  >
                    {titleError}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label
                    htmlFor="task-priority"
                    className="block text-xs font-medium text-muted-foreground mb-2"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    data-testid="select-task-priority"
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                  >
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  data-testid="button-submit-task"
                  type="submit"
                  className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-all duration-200 ease-out"
                  aria-label="Submit new task"
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
                      priority: "Normal",
                    });
                  }}
                  className="px-4 py-2 bg-background text-foreground border border-border/30 rounded-lg text-sm font-medium hover:bg-muted transition-all duration-200 ease-out"
                  aria-label="Cancel new task"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!focusMode && !presentationMode && (
          <div className="mb-6 flex gap-3 flex-wrap">
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
        )}

        {!presentationMode && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {["All", "In Progress", "Done", "Blocked"].map((f) => (
              <button
                key={f}
                data-testid={`button-filter-${f.toLowerCase().replace(" ", "-")}`}
                onClick={() => setFilter(f)}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium border border-border/30 transition-all duration-200 ease-out overflow-visible ${
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                aria-label={`Filter tasks by ${f}`}
              >
                {f}
                {filter === f && (
                  <span 
                    data-testid={`underline-filter-${f.toLowerCase().replace(" ", "-")}`}
                    className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary-foreground opacity-30 transform scale-x-100 transition-transform duration-200 ease-out"
                  ></span>
                )}
              </button>
            ))}
          </div>
        )}

        <h2 className="sr-only">Task Board</h2>
        <div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
          aria-atomic="false"
        >
          {filteredTasks.map((task: Task) => {
            const statusConfig =
              statusColorMap[task.status as keyof typeof statusColorMap];
            const StatusIcon = statusConfig.icon;
            const priority = task.priority || "Normal";
            const priorityStyle =
              priorityConfig[priority as keyof typeof priorityConfig];

            return (
              <div
                key={task.id}
                data-testid={`card-task-${task.id}`}
                className={`bg-card border border-border/30 p-5 rounded-xl hover:border-foreground/10 hover:shadow-sm transition-shadow transition-all duration-200 ease-out ${
                  presentationMode ? 'opacity-0 animate-fade-in' : ''
                }`}
                style={presentationMode ? { animation: 'fadeIn 250ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards' } : undefined}
              >
                <div className="mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityStyle.dot}`}
                      aria-label={`Priority: ${priority}`}
                    ></div>
                    <h2
                      className={`${
                        presentationMode ? "text-[1.05rem] font-medium" : focusMode ? "text-[1.1rem] font-semibold" : "text-base font-semibold"
                      } text-card-foreground flex-1 leading-tight`}
                    >
                      {task.title}
                    </h2>
                  </div>
                  <p
                    className="text-xs text-muted-foreground/70 ml-4 mb-3"
                    data-testid={`text-updated-${task.id}`}
                  >
                    {getRelativeTime(task.lastUpdated)}
                  </p>
                  <div className="flex flex-col gap-1 ml-4 mb-2">
                    <span className="text-[13px] font-medium text-muted-foreground/80">
                      Assigned to: <span className="text-foreground font-semibold">{task.assignee}</span>
                    </span>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/30 w-fit">
                      {task.assignee}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.badge}`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {!presentationMode && (
                    <select
                      data-testid={`select-status-${task.id}`}
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="text-xs border border-input bg-background rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                      aria-label={`Change status for ${task.title}`}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  )}
                </div>

                {/* View History Link */}
                {!presentationMode && task.history && task.history.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <button
                      data-testid={`button-view-history-${task.id}`}
                      onClick={() => toggleHistory(task.id)}
                      className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-all duration-200 ease-out"
                      aria-label={`${historyVisible[task.id] ? 'Hide' : 'View'} history for ${task.title}`}
                    >
                      {historyVisible[task.id] ? 'Hide History' : 'View History'}
                    </button>

                    {historyVisible[task.id] && (
                      <div
                        data-testid={`history-${task.id}`}
                        className="mt-2 space-y-1 transition-all duration-200 ease-out"
                      >
                        {task.history.slice(-3).reverse().map((entry, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-muted-foreground/70 ml-2"
                          >
                            • {formatHistoryDate(entry.date)} – {entry.oldStatus} → {entry.newStatus}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Overlay */}
      {insightVisible && !presentationMode && (
        <div
          id="insight-overlay"
          ref={insightOverlayRef}
          data-testid="overlay-insight"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInsightVisible(false);
            }
          }}
        >
          <div className="bg-card border border-border/30 rounded-lg shadow-lg p-6 max-w-md w-full" aria-describedby="insight-content">
            <h2 className="sr-only">Focus Frame Insights</h2>
            <div className="mb-6" id="insight-content">
              <h3 className="text-sm font-semibold text-foreground mb-3" id="insight-title">
                Focus Frame Insights
              </h3>

              <div className="space-y-4 text-left">
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground/80 mb-2">
                    Top 3 Tasks by Context Switch
                  </p>
                  <div className="space-y-1">
                    {insightData?.topSwitchTasks?.map((title, idx) => (
                      <p key={idx} className="text-sm text-foreground ml-2">
                        {idx + 1}. {title}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground/80 mb-2">
                    Most Recently Updated
                  </p>
                  <p className="text-sm text-foreground ml-2">
                    {insightData?.mostRecentTask}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
                    You've switched context {insightData?.contextSwitchTotal || 0} times across {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} today.
                  </p>
                </div>
              </div>
            </div>

            <button
              data-testid="button-close-insight"
              onClick={() => setInsightVisible(false)}
              className="w-full px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-all duration-200 ease-out"
              aria-label="Close insight overlay"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Presentation Mode: Merged Trace + Insight Panel */}
      {presentationMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-muted/30 border-t border-border/40 rounded-t-lg">
          <div className="max-w-6xl mx-auto px-4 py-3" role="status" aria-live="polite">
            <h2 className="sr-only">Cognitive Trace Metrics</h2>
            <div className="grid grid-cols-2 gap-8 text-[12px] text-muted-foreground font-normal tracking-tight leading-snug">
              {/* Left Column: Trace Metrics */}
              <div className="space-y-2 text-left">
                <p className="uppercase tracking-wide mb-3 font-medium">Trace Metrics</p>
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wide">Avg Context Switch</span>
                  <span className="font-semibold text-foreground" data-testid="metric-avg-context-switch">
                    {avgContextSwitch}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wide">Focus Updates</span>
                  <span className="font-semibold text-foreground" data-testid="metric-focus-updates">
                    {focusUpdates}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wide">Updated Today</span>
                  <span className="font-semibold text-foreground" data-testid="metric-updated-today">
                    {traceData.tasksUpdatedToday > 999 ? '999+' : traceData.tasksUpdatedToday}
                  </span>
                </div>
              </div>

              {/* Right Column: Insight Summary */}
              <div className="space-y-2 text-left">
                <p className="uppercase tracking-wide mb-3 font-medium">Focus Insights</p>
                <div>
                  <span className="uppercase tracking-wide">Top Task</span>
                  <p className="text-sm text-foreground mt-1">
                    {insightData?.topSwitchTasks?.[0] || 'None'}
                  </p>
                </div>
                <div className="mt-2">
                  <span className="uppercase tracking-wide">Most Recent</span>
                  <p className="text-sm text-foreground mt-1">
                    {insightData?.mostRecentTask || 'None'}
                  </p>
                </div>
                <div className="mt-2">
                  <span className="uppercase tracking-wide">Total Switches</span>
                  <span className="font-semibold text-foreground ml-2">
                    {insightData?.contextSwitchTotal || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Brand Signature Footer */}
          <div className="text-[10px] text-muted-foreground/50 text-center py-1 tracking-widest uppercase">
            Delegate Lens · v1.0 · Cognitive Clarity Suite
          </div>
        </div>
      )}

      {/* Regular Trace Panel (non-presentation mode) */}
      {!presentationMode && (
        <div className={`fixed bottom-0 left-0 right-0 transition-opacity duration-200 ease-out ${insightVisible ? 'opacity-40' : 'opacity-100'}`}>
          <button
            data-testid="button-toggle-trace"
            onClick={toggleTrace}
            className="w-full bg-muted/30 border-t border-border/40 py-2 px-4 text-xs text-muted-foreground hover:bg-muted/50 transition-all duration-200 ease-out"
            aria-label={traceVisible ? "Hide cognitive trace" : "Show cognitive trace"}
            aria-controls="cognitive-trace-panel"
            aria-expanded={traceVisible}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Trace</span>
            </div>
          </button>

          {traceVisible && (
            <div
              id="cognitive-trace-panel"
              data-testid="panel-cognitive-trace"
              className="bg-muted/30 border-t border-border/40 rounded-t-lg transition-opacity duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)] opacity-100"
              role="status"
            >
              <div className="max-w-6xl mx-auto px-4 py-3">
                <h2 className="sr-only">Cognitive Trace Metrics</h2>
                <div className="flex flex-wrap gap-6 text-xs text-muted-foreground font-normal tracking-tight text-left">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide">Avg Context Switch</span>
                    <span className="font-semibold text-foreground" data-testid="metric-avg-context-switch">
                      {avgContextSwitch}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide">Focus Updates</span>
                    <span className="font-semibold text-foreground" data-testid="metric-focus-updates">
                      {focusUpdates}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide">Updated Today</span>
                    <span className="font-semibold text-foreground" data-testid="metric-updated-today">
                      {traceData.tasksUpdatedToday > 999 ? '999+' : traceData.tasksUpdatedToday}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
