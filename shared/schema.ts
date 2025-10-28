import { z } from "zod";

export const taskStatusEnum = ["In Progress", "Done", "Blocked"] as const;
export const taskAssigneeEnum = ["Executive", "Assistant"] as const;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  assignee: z.enum(taskAssigneeEnum),
  status: z.enum(taskStatusEnum),
});

export const insertTaskSchema = taskSchema.omit({ id: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskStatus = typeof taskStatusEnum[number];
export type TaskAssignee = typeof taskAssigneeEnum[number];
