import type { CreateTaskBody, TaskDto, UpdateTaskBody } from "../types/api";
import { apiRequest } from "./client";

export type TasksQuery = {
  from?: string;
  to?: string;
};

function buildQuery(q: TasksQuery): string {
  const p = new URLSearchParams();
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function fetchTasks(query: TasksQuery = {}): Promise<TaskDto[]> {
  return apiRequest<TaskDto[]>(`/Tasks${buildQuery(query)}`);
}

export async function fetchTask(id: string): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/Tasks/${encodeURIComponent(id)}`);
}

export async function createTask(body: CreateTaskBody): Promise<TaskDto> {
  return apiRequest<TaskDto>("/Tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTask(
  id: string,
  body: UpdateTaskBody,
): Promise<TaskDto> {
  return apiRequest<TaskDto>(`/Tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await apiRequest<void>(`/Tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
