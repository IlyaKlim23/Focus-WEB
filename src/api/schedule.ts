import {
  PLACEHOLDER_USER_ID,
  type ScheduleRequestBody,
  type ScheduleResponseDto,
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
