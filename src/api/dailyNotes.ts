import type { DailyNoteDto, DailyNoteUpsertBody } from "../types/api";
import { ApiError, apiRequest } from "./client";

export async function fetchDailyNote(
  dateYmd: string,
): Promise<DailyNoteDto | null> {
  try {
    return await apiRequest<DailyNoteDto>(
      `/daily-notes/${encodeURIComponent(dateYmd)}`,
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function upsertDailyNote(
  dateYmd: string,
  body: DailyNoteUpsertBody,
): Promise<DailyNoteDto> {
  return apiRequest<DailyNoteDto>(
    `/daily-notes/${encodeURIComponent(dateYmd)}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}
