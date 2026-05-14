import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { createManualSlot, deleteManualSlot, fetchScheduleByDate, generateSchedule, updateManualSlot } from "../api/schedule";
import { fetchTasks } from "../api/tasks";
import { formatRuDateTime, todayYmd } from "../lib/dates";

export function SchedulePage() {
  const [date, setDate] = useState(todayYmd);
  const [error, setError] = useState<string | null>(null);
  const [manualTaskId, setManualTaskId] = useState("");
  const [manualStart, setManualStart] = useState("");
  const [manualDuration, setManualDuration] = useState(60);

  const { mutate, reset, isPending, data: result } = useMutation({
    // Передаём "локальную" дату без Z, чтобы день не смещался из-за таймзоны
    mutationFn: () => generateSchedule(`${date}T00:00:00`),
    onSuccess: () => setError(null),
    onError: (e: unknown) => {
      setError(
        e instanceof ApiError ? e.message : "Не удалось построить расписание",
      );
    },
  });

  useEffect(() => {
    reset();
  }, [date, reset]);

  const persistedQuery = useQuery({
    queryKey: ["schedule", date] as const,
    queryFn: () => fetchScheduleByDate(date),
  });
  const tasksQuery = useQuery({
    queryKey: ["tasks-for-schedule"] as const,
    queryFn: () => fetchTasks(),
  });
  const addManualMut = useMutation({
    mutationFn: () =>
      createManualSlot({
        taskId: manualTaskId,
        slotStart: new Date(manualStart).toISOString(),
        durationMinutes: manualDuration,
      }),
    onSuccess: async () => {
      setError(null);
      await persistedQuery.refetch();
    },
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось добавить слот"),
  });
  const delManualMut = useMutation({
    mutationFn: (id: string) => deleteManualSlot(id),
    onSuccess: async () => {
      setError(null);
      await persistedQuery.refetch();
    },
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось удалить слот"),
  });
  const updManualMut = useMutation({
    mutationFn: (args: { id: string; slotStart: string; durationMinutes: number }) =>
      updateManualSlot(args.id, {
        slotStart: new Date(args.slotStart).toISOString(),
        durationMinutes: args.durationMinutes,
      }),
    onSuccess: async () => {
      setError(null);
      await persistedQuery.refetch();
    },
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось обновить слот"),
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Расписание</h1>
        <p className="muted">
          Запрос к API генерирует слоты на выбранный день с учётом прогноза
          продуктивности и ваших задач.
        </p>
      </header>

      <section className="card stack">
        <div className="row row--wrap row--space">
          <label className="field field--inline">
            <span className="field__label">Дата</span>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn--primary"
            disabled={isPending}
            onClick={() => mutate()}
          >
            {isPending ? "Расчёт…" : "Сгенерировать расписание"}
          </button>
        </div>

        {error ? <div className="banner banner--error">{error}</div> : null}
        <div className="card stack">
          <h2 className="section-title">Ручное редактирование расписания</h2>
          <label className="field">
            <span className="field__label">Задача</span>
            <select
              className="input"
              value={manualTaskId}
              onChange={(e) => setManualTaskId(e.target.value)}
            >
              <option value="">Выберите задачу</option>
              {(tasksQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <div className="row row--wrap">
            <label className="field">
              <span className="field__label">Начало</span>
              <input
                className="input"
                type="datetime-local"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Длительность, мин</span>
              <input
                className="input"
                type="number"
                min={5}
                value={manualDuration}
                onChange={(e) => setManualDuration(Number(e.target.value) || 60)}
              />
            </label>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={addManualMut.isPending || !manualTaskId || !manualStart}
            onClick={() => addManualMut.mutate()}
          >
            {addManualMut.isPending ? "Сохранение…" : "Добавить слот вручную"}
          </button>
        </div>

        {result ? (
          <div className="stack">
            <p className="muted">
              День: {formatRuDateTime(result.date)}
            </p>
            {result.slots.length === 0 ? (
              <p className="muted">Слотов нет — проверьте задачи и модель.</p>
            ) : (
              <ol className="schedule-list">
                {result.slots.map((s, i) => (
                  <li key={`${s.slotStart}-${s.taskId}-${i}`} className="schedule-slot">
                    <div className="schedule-slot__time">
                      {formatRuDateTime(s.slotStart)}
                    </div>
                    <div className="schedule-slot__body">
                      <div className="schedule-slot__title">{s.taskTitle}</div>
                      <div className="muted schedule-slot__meta">
                        {s.durationMinutes} мин · id задачи:{" "}
                        <code className="code">{s.taskId}</code>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}

        <div className="stack">
          <h2 className="section-title">Сохранённые слоты дня</h2>
          {persistedQuery.isLoading ? (
            <p className="muted">Загрузка…</p>
          ) : (persistedQuery.data?.slots.length ?? 0) === 0 ? (
            <p className="muted">Слотов пока нет</p>
          ) : (
            <ol className="schedule-list">
              {(persistedQuery.data?.slots ?? []).map((s) => (
                <li key={s.id} className="schedule-slot">
                  <div className="schedule-slot__time">{formatRuDateTime(s.slotStart)}</div>
                  <div className="schedule-slot__body">
                    <div className="schedule-slot__title">{s.taskTitle}</div>
                    <div className="muted schedule-slot__meta">{s.durationMinutes} мин</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--small btn--ghost"
                    onClick={() => {
                      const localStart = toLocalDatetimeValue(s.slotStart);
                      const nextStart = prompt("Новое время начала (YYYY-MM-DDTHH:mm)", localStart);
                      if (!nextStart) return;
                      const nextDurationRaw = prompt("Новая длительность (мин)", String(s.durationMinutes));
                      if (!nextDurationRaw) return;
                      const nextDuration = Number(nextDurationRaw);
                      if (Number.isNaN(nextDuration) || nextDuration < 5) {
                        setError("Длительность должна быть числом не менее 5 минут");
                        return;
                      }
                      updManualMut.mutate({ id: s.id, slotStart: nextStart, durationMinutes: nextDuration });
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={() => delManualMut.mutate(s.id)}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

function toLocalDatetimeValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
