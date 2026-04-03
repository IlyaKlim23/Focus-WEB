export type AuthResponse = {
  accessToken: string;
  userId: string;
  email: string;
  displayName?: string | null;
  expiresAt: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  displayName?: string | null;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type DailyNoteDto = {
  id: string;
  date: string;
  content: string;
  moodScore?: number | null;
  energyLevel?: number | null;
  extractedFactors?: string | null;
  createdAt: string;
};

export type DailyNoteUpsertBody = {
  content: string;
  moodScore?: number | null;
  energyLevel?: number | null;
};

export type ScheduleRequestBody = {
  date: string;
  userId: string;
};

export type ScheduleSlotDto = {
  slotStart: string;
  taskId: string;
  taskTitle: string;
  durationMinutes: number;
};

export type ScheduleResponseDto = {
  date: string;
  slots: ScheduleSlotDto[];
};

export const TaskPriority = {
  Low: 0,
  Medium: 1,
  High: 2,
  Critical: 3,
} as const;

export type TaskPriorityValue = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskItemStatus = {
  Todo: 0,
  InProgress: 1,
  Done: 2,
  Cancelled: 3,
} as const;

export type TaskItemStatusValue =
  (typeof TaskItemStatus)[keyof typeof TaskItemStatus];

export type TaskDto = {
  id: string;
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  interruptionCount: number;
  dueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  categoryId?: string | null;
};

export type CreateTaskBody = {
  title: string;
  description?: string | null;
  priority: number;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  categoryId?: string | null;
};

export type UpdateTaskBody = {
  title?: string | null;
  description?: string | null;
  status?: number | null;
  priority?: number | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  interruptionCount?: number | null;
  dueDate?: string | null;
  categoryId?: string | null;
};

export const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000000";
