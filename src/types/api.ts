export type AuthResponse = {
  accessToken: string;
  userId: string;
  email: string;
  displayName?: string | null;
  role: "User" | "Developer";
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

export type ResetPasswordBody = {
  email: string;
  newPassword: string;
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
  id: string;
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

export type NotificationPreferenceDto = {
  email: string;
  isEnabled: boolean;
  remindBeforeMinutes: number;
  unavailableFromMinutes?: number | null;
  unavailableToMinutes?: number | null;
};

export type UpsertNotificationPreferenceBody = NotificationPreferenceDto;

export type QuestionnaireDto = {
  id: string;
  code: string;
  name: string;
  description: string;
};

export type QuestionnaireQuestionDto = {
  id: string;
  text: string;
  sortOrder: number;
  minValue: number;
  maxValue: number;
};

export type UserQuestionnaireScheduleDto = {
  questionnaireId: string;
  cadence: string;
  nextDueAtUtc: string;
  isEnabled: boolean;
};

export type UpsertQuestionnaireScheduleBody = {
  questionnaireId: string;
  cadence: string;
  nextDueAtUtc?: string | null;
  isEnabled: boolean;
};

export type QuestionnaireAnswerItem = {
  questionId: string;
  value: number;
};

export type SubmitQuestionnaireBody = {
  questionnaireId: string;
  answers: QuestionnaireAnswerItem[];
};

export type QuestionnaireResponseDto = {
  id: string;
  questionnaireId: string;
  submittedAtUtc: string;
  totalScore: number;
};

export type DailyQuestionnairePoint = {
  date: string;
  avgScore: number;
  submissions: number;
};

export type QuestionnaireBreakdownItem = {
  questionnaireId: string;
  avgScore: number;
  submissions: number;
};

export type DeveloperQuestionnaireAnalyticsResponse = {
  dailyTrend: DailyQuestionnairePoint[];
  byQuestionnaire: QuestionnaireBreakdownItem[];
};

export type FeedbackDto = {
  id: string;
  userId: string;
  message: string;
  rating: number;
  createdAt: string;
};

export type CreateFeedbackBody = {
  message: string;
  rating: number;
};

export const PLACEHOLDER_USER_ID = "00000000-0000-0000-0000-000000000000";
