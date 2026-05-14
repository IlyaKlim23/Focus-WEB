import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError } from "../api/client";
import {
  fetchQuestionnaireQuestions,
  fetchQuestionnaires,
  fetchQuestionnaireSchedules,
  saveQuestionnaireSchedule,
  submitQuestionnaire,
} from "../api/questionnaires";

export function QuestionnairesPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [answerValues, setAnswerValues] = useState<Record<string, number>>({});

  const questionnairesQuery = useQuery({
    queryKey: ["questionnaires"] as const,
    queryFn: fetchQuestionnaires,
  });

  const questionnaireId = selectedId || questionnairesQuery.data?.[0]?.id || "";
  const questionsQuery = useQuery({
    queryKey: ["questionnaire-questions", questionnaireId] as const,
    queryFn: () => fetchQuestionnaireQuestions(questionnaireId),
    enabled: Boolean(questionnaireId),
  });

  const schedulesQuery = useQuery({
    queryKey: ["questionnaire-schedules"] as const,
    queryFn: fetchQuestionnaireSchedules,
  });

  const activeSchedule = useMemo(
    () => schedulesQuery.data?.find((x) => x.questionnaireId === questionnaireId),
    [schedulesQuery.data, questionnaireId],
  );

  const scheduleMut = useMutation({
    mutationFn: () =>
      saveQuestionnaireSchedule({
        questionnaireId,
        cadence: activeSchedule?.cadence ?? "Weekly",
        isEnabled: true,
        nextDueAtUtc: null,
      }),
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось включить регулярный опрос"),
  });

  const submitMut = useMutation({
    mutationFn: () =>
      submitQuestionnaire({
        questionnaireId,
        answers: Object.entries(answerValues).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      }),
    onSuccess: () => {
      setError(null);
      setAnswerValues({});
    },
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось отправить ответы"),
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Психологические опросники</h1>
        <p className="muted">Регулярные самоотчёты помогают анализировать самочувствие.</p>
      </header>

      <section className="card stack">
        {error ? <div className="banner banner--error">{error}</div> : null}
        <label className="field">
          <span className="field__label">Опросник</span>
          <select
            className="input"
            value={questionnaireId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {(questionnairesQuery.data ?? []).map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </label>

        <div className="row row--wrap">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={scheduleMut.isPending || !questionnaireId}
            onClick={() => scheduleMut.mutate()}
          >
            {scheduleMut.isPending ? "Сохранение…" : "Включить регулярный опрос"}
          </button>
          {activeSchedule ? (
            <span className="muted">
              Интервал: {activeSchedule.cadence}, следующий:{" "}
              {new Date(activeSchedule.nextDueAtUtc).toLocaleString("ru-RU")}
            </span>
          ) : null}
        </div>

        {questionsQuery.isLoading ? (
          <p className="muted">Загрузка вопросов…</p>
        ) : (
          (questionsQuery.data ?? []).map((q) => (
            <label key={q.id} className="field">
              <span className="field__label">{q.text}</span>
              <input
                className="input"
                type="number"
                min={q.minValue}
                max={q.maxValue}
                value={answerValues[q.id] ?? ""}
                onChange={(e) =>
                  setAnswerValues((prev) => ({
                    ...prev,
                    [q.id]: Number(e.target.value),
                  }))
                }
              />
            </label>
          ))
        )}

        <button
          type="button"
          className="btn btn--primary"
          disabled={submitMut.isPending || Object.keys(answerValues).length === 0}
          onClick={() => submitMut.mutate()}
        >
          {submitMut.isPending ? "Отправка…" : "Отправить ответы"}
        </button>
      </section>
    </div>
  );
}
