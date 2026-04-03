import { TaskItemStatus, TaskPriority } from "../types/api";

const priorityMap: Record<number, string> = {
  [TaskPriority.Low]: "Низкий",
  [TaskPriority.Medium]: "Средний",
  [TaskPriority.High]: "Высокий",
  [TaskPriority.Critical]: "Критический",
};

const statusMap: Record<number, string> = {
  [TaskItemStatus.Todo]: "К выполнению",
  [TaskItemStatus.InProgress]: "В работе",
  [TaskItemStatus.Done]: "Готово",
  [TaskItemStatus.Cancelled]: "Отменена",
};

export function priorityLabel(priority: number): string {
  return priorityMap[priority] ?? `Приоритет ${priority}`;
}

export function statusLabel(status: number): string {
  return statusMap[status] ?? `Статус ${status}`;
}

export const priorityOptions = [
  { value: TaskPriority.Low, label: priorityMap[TaskPriority.Low] },
  { value: TaskPriority.Medium, label: priorityMap[TaskPriority.Medium] },
  { value: TaskPriority.High, label: priorityMap[TaskPriority.High] },
  { value: TaskPriority.Critical, label: priorityMap[TaskPriority.Critical] },
];

export const statusOptions = [
  { value: TaskItemStatus.Todo, label: statusMap[TaskItemStatus.Todo] },
  {
    value: TaskItemStatus.InProgress,
    label: statusMap[TaskItemStatus.InProgress],
  },
  { value: TaskItemStatus.Done, label: statusMap[TaskItemStatus.Done] },
  {
    value: TaskItemStatus.Cancelled,
    label: statusMap[TaskItemStatus.Cancelled],
  },
];
