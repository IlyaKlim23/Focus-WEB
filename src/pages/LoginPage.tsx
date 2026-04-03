import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login, user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isReady && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card card">
        <h1 className="auth__title">Вход</h1>
        <p className="muted auth__subtitle">Focus — планировщик с прогнозом продуктивности</p>
        <form className="stack" onSubmit={onSubmit}>
          {error ? <div className="banner banner--error">{error}</div> : null}
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Пароль</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={pending}>
            {pending ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="auth__footer muted">
          Нет аккаунта? <Link to="/register">Регистрация</Link>
        </p>
      </div>
    </div>
  );
}
