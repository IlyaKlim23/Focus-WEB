import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { generateSchedule } from "../api/schedule";
import { formatRuDateTime, todayYmd, ymdToIsoStartOfDay } from "../lib/dates";

export function SchedulePage() {
  const [date, setDate] = useState(todayYmd);
  const [error, setError] = useState<string | null>(null);

  const { mutate, reset, isPending, data: result } = useMutation({
    mutationFn: () => generateSchedule(ymdToIsoStartOfDay(date)),
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
      </section>
    </div>
  );
}
