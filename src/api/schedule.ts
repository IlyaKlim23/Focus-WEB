import {
  PLACEHOLDER_USER_ID,
  type ScheduleRequestBody,
  type ScheduleResponseDto,
  type ScheduleSlotDto,
} from "../types/api";
import { apiRequest } from "./client";

export async function generateSchedule(
  dateIso: string,
): Promise<ScheduleResponseDto> {
  const body: ScheduleRequestBody = {
    date: dateIso,
    userId: PLACEHOLDER_USER_ID,
  };
  return apiRequest<ScheduleResponseDto>("/Schedule", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchScheduleByDate(dateYmd: string): Promise<ScheduleResponseDto> {
  return apiRequest<ScheduleResponseDto>(`/Schedule/${encodeURIComponent(dateYmd)}`);
}

export async function createManualSlot(body: {
  slotStart: string;
  taskId: string;
  durationMinutes: number;
}): Promise<ScheduleSlotDto> {
  return apiRequest<ScheduleSlotDto>("/Schedule/slots", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateManualSlot(
  id: string,
  body: { slotStart?: string | null; taskId?: string | null; durationMinutes?: number | null },
): Promise<ScheduleSlotDto> {
  return apiRequest<ScheduleSlotDto>(`/Schedule/slots/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteManualSlot(id: string): Promise<void> {
  await apiRequest<void>(`/Schedule/slots/${encodeURIComponent(id)}`, { method: "DELETE" });
}
