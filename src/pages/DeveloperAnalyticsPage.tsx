import { useQuery } from "@tanstack/react-query";
import { fetchQuestionnaireAnalytics } from "../api/developerAnalytics";
import { fetchRecentFeedbackForDeveloper } from "../api/feedback";
import { ApiError } from "../api/client";

export function DeveloperAnalyticsPage() {
  const q = useQuery({
    queryKey: ["developer", "questionnaire-analytics"] as const,
    queryFn: () => fetchQuestionnaireAnalytics(30),
  });
  const feedbackQ = useQuery({
    queryKey: ["developer", "feedback"] as const,
    queryFn: () => fetchRecentFeedbackForDeveloper(200),
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Developer аналитика</h1>
        <p className="muted">Данные из ClickHouse по опросникам за последние 30 дней</p>
      </header>

      <section className="card stack">
        {q.isLoading ? <p className="muted">Загрузка…</p> : null}
        {q.isError ? (
          <div className="banner banner--error">
            {q.error instanceof ApiError ? q.error.message : "Не удалось загрузить аналитику"}
          </div>
        ) : null}

        {q.data ? (
          <>
            <h2 className="section-title">Тренд среднего балла по дням</h2>
            <div className="stack">
              {q.data.dailyTrend.length === 0 ? (
                <p className="muted">Пока нет данных</p>
              ) : (
                q.data.dailyTrend.map((x) => {
                  const width = Math.max(2, Math.min(100, (x.avgScore / 15) * 100));
                  return (
                    <div key={x.date} className="stack">
                      <div className="row row--space">
                        <span>{x.date}</span>
                        <span className="muted">
                          avg {x.avgScore.toFixed(2)} · {x.submissions} ответов
                        </span>
                      </div>
                      <div style={{ background: "#e5e7eb", height: 10, borderRadius: 999 }}>
                        <div
                          style={{
                            width: `${width}%`,
                            height: "100%",
                            background: "#4f46e5",
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <h2 className="section-title">Сравнение по опросникам</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Questionnaire ID</th>
                  <th>Avg score</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {q.data.byQuestionnaire.map((x) => (
                  <tr key={x.questionnaireId}>
                    <td>
                      <code className="code">{x.questionnaireId}</code>
                    </td>
                    <td>{x.avgScore.toFixed(2)}</td>
                    <td>{x.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="section-title">Последняя обратная связь пользователей</h2>
            {feedbackQ.isLoading ? (
              <p className="muted">Загрузка…</p>
            ) : feedbackQ.isError ? (
              <div className="banner banner--error">Не удалось загрузить обратную связь</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>Оценка</th>
                    <th>Сообщение</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {(feedbackQ.data ?? []).map((x) => (
                    <tr key={x.id}>
                      <td>
                        <code className="code">{x.userId}</code>
                      </td>
                      <td>{x.rating}</td>
                      <td>{x.message}</td>
                      <td>{new Date(x.createdAt).toLocaleString("ru-RU")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
