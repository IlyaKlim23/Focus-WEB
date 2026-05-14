import type {
  NotificationPreferenceDto,
  UpsertNotificationPreferenceBody,
} from "../types/api";
import { ApiError, apiRequest } from "./client";

export async function fetchNotificationSettings(): Promise<NotificationPreferenceDto | null> {
  try {
    return await apiRequest<NotificationPreferenceDto>("/notification-settings");
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function saveNotificationSettings(
  body: UpsertNotificationPreferenceBody,
): Promise<NotificationPreferenceDto> {
  return apiRequest<NotificationPreferenceDto>("/notification-settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
