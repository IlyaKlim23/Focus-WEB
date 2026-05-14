import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/", label: "Главная", end: true },
  { to: "/tasks", label: "Задачи" },
  { to: "/notes", label: "Дневник" },
  { to: "/schedule", label: "Расписание" },
  { to: "/notifications", label: "Оповещения" },
  { to: "/questionnaires", label: "Опросники" },
  { to: "/feedback", label: "Обратная связь" },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" end>
          Focus
        </NavLink>
        <nav className="nav">
          {[
            ...nav,
            ...(user?.role === "Developer"
              ? [{ to: "/developer/analytics", label: "Developer", end: false }]
              : []),
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav__link${isActive ? " nav__link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar__user">
          <span className="muted topbar__email" title={user?.email}>
            {user?.displayName?.trim() || user?.email}
          </span>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
