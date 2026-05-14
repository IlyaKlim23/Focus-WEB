import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "../api/client";
import { createFeedback, fetchMyFeedback } from "../api/feedback";

export function FeedbackPage() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const feedbackQuery = useQuery({
    queryKey: ["feedback", "mine"] as const,
    queryFn: () => fetchMyFeedback(50),
  });

  const createMut = useMutation({
    mutationFn: () => createFeedback({ message: message.trim(), rating }),
    onSuccess: () => {
      setMessage("");
      setRating(5);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["feedback", "mine"] });
    },
    onError: (e: unknown) =>
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить обратную связь"),
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Обратная связь</h1>
        <p className="muted">Поделитесь впечатлением о приложении</p>
      </header>
      <section className="card stack">
        {error ? <div className="banner banner--error">{error}</div> : null}
        <label className="field">
          <span className="field__label">Сообщение</span>
          <textarea
            className="input input--area"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Оценка</span>
          <input
            className="input"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value) || 5)}
          />
        </label>
        <button
          type="button"
          className="btn btn--primary"
          disabled={createMut.isPending || !message.trim()}
          onClick={() => createMut.mutate()}
        >
          {createMut.isPending ? "Отправка…" : "Отправить"}
        </button>
      </section>

      <section className="card stack">
        <h2 className="section-title">Мои отзывы</h2>
        {feedbackQuery.isLoading ? (
          <p className="muted">Загрузка…</p>
        ) : feedbackQuery.isError ? (
          <div className="banner banner--error">Не удалось загрузить отзывы</div>
        ) : (
          <ul className="stack">
            {(feedbackQuery.data ?? []).map((x) => (
              <li key={x.id} className="card">
                <div className="row row--space">
                  <strong>{x.rating}/5</strong>
                  <span className="muted">{new Date(x.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <p>{x.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
