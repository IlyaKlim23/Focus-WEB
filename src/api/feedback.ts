import type { CreateFeedbackBody, FeedbackDto } from "../types/api";
import { apiRequest } from "./client";

export async function fetchMyFeedback(take = 50): Promise<FeedbackDto[]> {
  return apiRequest<FeedbackDto[]>(`/feedback?take=${encodeURIComponent(String(take))}`);
}

export async function createFeedback(body: CreateFeedbackBody): Promise<FeedbackDto> {
  return apiRequest<FeedbackDto>("/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchRecentFeedbackForDeveloper(take = 200): Promise<FeedbackDto[]> {
  return apiRequest<FeedbackDto[]>(
    `/developer/analytics/feedback?take=${encodeURIComponent(String(take))}`,
  );
}
