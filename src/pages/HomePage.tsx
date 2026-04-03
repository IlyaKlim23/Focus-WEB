import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tiles = [
  {
    to: "/tasks",
    title: "Задачи",
    text: "Создавайте и ведите задачи с приоритетами, сроками и фактическим временем — данные для модели продуктивности.",
  },
  {
    to: "/notes",
    title: "Дневник дня",
    text: "Краткая заметка в конце дня: настроение, энергия — контекст для персонализации прогнозов.",
  },
  {
    to: "/schedule",
    title: "Расписание",
    text: "Сгенерируйте план на день с учётом прогноза продуктивности по слотам.",
  },
];

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero card">
        <h1 className="page__title">
          Здравствуйте{user?.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="hero__lead">
          <strong>Focus</strong> — умный персональный планировщик задач с прогнозом
          продуктивности на основе машинного обучения. Система учитывает ваши привычки
          и историю выполнения, чтобы предлагать удобные окна для работы.
        </p>
      </section>

      <ul className="tile-grid">
        {tiles.map((t) => (
          <li key={t.to}>
            <Link to={t.to} className="tile card">
              <h2 className="tile__title">{t.title}</h2>
              <p className="tile__text muted">{t.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
