import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import { fetchDailyNote, upsertDailyNote } from "../api/dailyNotes";
import { formatRuDateTime, todayYmd } from "../lib/dates";

const SCALE_OPTIONS = [1, 2, 3, 4, 5] as const;

/** Целое 1–5 для UI; иначе пусто */
function noteScaleToFormValue(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "";
  const n = Math.round(Number(v));
  if (n < 1 || n > 5) return "";
  return String(n);
}

export function NotesPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayYmd);
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const noteQuery = useQuery({
    queryKey: ["daily-note", date] as const,
    queryFn: () => fetchDailyNote(date),
  });

  useEffect(() => {
    const n = noteQuery.data;
    if (n) {
      setContent(n.content);
      setMoodScore(noteScaleToFormValue(n.moodScore));
      setEnergyLevel(noteScaleToFormValue(n.energyLevel));
    } else if (!noteQuery.isLoading && noteQuery.isFetched) {
      setContent("");
      setMoodScore("");
      setEnergyLevel("");
    }
  }, [noteQuery.data, noteQuery.isFetched, noteQuery.isLoading]);

  const saveMut = useMutation({
    mutationFn: () =>
      upsertDailyNote(date, {
        content: content.trim(),
        moodScore: moodScore === "" ? null : Number(moodScore),
        energyLevel: energyLevel === "" ? null : Number(energyLevel),
      }),
    onSuccess: (data) => {
      setSaveError(null);
      void qc.setQueryData(["daily-note", date], data);
    },
    onError: (e: unknown) => {
      setSaveError(e instanceof ApiError ? e.message : "Не удалось сохранить");
    },
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Дневник дня</h1>
        <p className="muted">
          Заметка в конце дня помогает модели учитывать контекст: успехи,
          отвлечения, самочувствие.
        </p>
      </header>

      <section className="card stack">
        <label className="field">
          <span className="field__label">Дата</span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {noteQuery.isLoading ? (
          <p className="muted">Загрузка…</p>
        ) : noteQuery.isError ? (
          <div className="banner banner--error">
            {noteQuery.error instanceof ApiError
              ? noteQuery.error.message
              : "Ошибка загрузки"}
          </div>
        ) : noteQuery.data === null ? (
          <p className="muted">За эту дату заметки ещё нет — создайте ниже.</p>
        ) : noteQuery.data ? (
          <p className="muted">
            Обновлено: {formatRuDateTime(noteQuery.data.createdAt)}
            {noteQuery.data.extractedFactors ? (
              <>
                <br />
                <span className="factors">
                  Факторы (NLP): {noteQuery.data.extractedFactors}
                </span>
              </>
            ) : null}
          </p>
        ) : null}

        {saveError ? (
          <div className="banner banner--error">{saveError}</div>
        ) : null}

        <label className="field">
          <span className="field__label">Текст заметки</span>
          <textarea
            className="input input--area"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Как прошёл день, что мешало, что получилось…"
          />
        </label>

        <div className="row row--wrap">
          <label className="field">
            <span className="field__label">Настроение (1–5, необязательно)</span>
            <select
              className="input"
              value={moodScore}
              onChange={(e) => setMoodScore(e.target.value)}
            >
              <option value="">Не указано</option>
              {SCALE_OPTIONS.map((v) => (
                <option key={v} value={String(v)}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Энергия (1–5, необязательно)</span>
            <select
              className="input"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
            >
              <option value="">Не указано</option>
              {SCALE_OPTIONS.map((v) => (
                <option key={v} value={String(v)}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          disabled={saveMut.isPending || !content.trim()}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? "Сохранение…" : "Сохранить заметку"}
        </button>
      </section>
    </div>
  );
}
