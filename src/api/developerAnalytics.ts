import type { DeveloperQuestionnaireAnalyticsResponse } from "../types/api";
import { apiRequest } from "./client";

export async function fetchQuestionnaireAnalytics(
  days = 30,
): Promise<DeveloperQuestionnaireAnalyticsResponse> {
  return apiRequest<DeveloperQuestionnaireAnalyticsResponse>(
    `/developer/analytics/questionnaires?days=${encodeURIComponent(String(days))}`,
  );
}
