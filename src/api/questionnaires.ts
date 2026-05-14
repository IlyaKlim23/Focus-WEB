import type {
  QuestionnaireDto,
  QuestionnaireQuestionDto,
  QuestionnaireResponseDto,
  SubmitQuestionnaireBody,
  UpsertQuestionnaireScheduleBody,
  UserQuestionnaireScheduleDto,
} from "../types/api";
import { apiRequest } from "./client";

export async function fetchQuestionnaires(): Promise<QuestionnaireDto[]> {
  return apiRequest<QuestionnaireDto[]>("/psychological-questionnaires");
}

export async function fetchQuestionnaireQuestions(
  id: string,
): Promise<QuestionnaireQuestionDto[]> {
  return apiRequest<QuestionnaireQuestionDto[]>(
    `/psychological-questionnaires/${encodeURIComponent(id)}/questions`,
  );
}

export async function fetchQuestionnaireSchedules(): Promise<UserQuestionnaireScheduleDto[]> {
  return apiRequest<UserQuestionnaireScheduleDto[]>(
    "/psychological-questionnaires/schedules",
  );
}

export async function saveQuestionnaireSchedule(
  body: UpsertQuestionnaireScheduleBody,
): Promise<UserQuestionnaireScheduleDto> {
  return apiRequest<UserQuestionnaireScheduleDto>(
    "/psychological-questionnaires/schedules",
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function submitQuestionnaire(
  body: SubmitQuestionnaireBody,
): Promise<QuestionnaireResponseDto> {
  return apiRequest<QuestionnaireResponseDto>(
    "/psychological-questionnaires/responses",
    { method: "POST", body: JSON.stringify(body) },
  );
}
