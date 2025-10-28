import type { Task } from "@shared/schema";

const TASKS_KEY = "delegate-lens-tasks";

export const localStorageUtils = {
  getTasks: (): Task[] => {
    try {
      const stored = localStorage.getItem(TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading tasks from localStorage:", error);
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  },

  addTask: (task: Task): void => {
    const tasks = localStorageUtils.getTasks();
    tasks.push(task);
    localStorageUtils.saveTasks(tasks);
  },

  updateTask: (id: string, updatedTask: Task): void => {
    const tasks = localStorageUtils.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      localStorageUtils.saveTasks(tasks);
    }
  },

  deleteTask: (id: string): void => {
    const tasks = localStorageUtils.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    localStorageUtils.saveTasks(filtered);
  },
};
