import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register, user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim() || null,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось зарегистрироваться",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card card">
        <h1 className="auth__title">Регистрация</h1>
        <p className="muted auth__subtitle">Создайте аккаунт Focus</p>
        <form className="stack" onSubmit={onSubmit}>
          {error ? <div className="banner banner--error">{error}</div> : null}
          <label className="field">
            <span className="field__label">Отображаемое имя</span>
            <input
              className="input"
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Необязательно"
            />
          </label>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button className="btn btn--primary" type="submit" disabled={pending}>
            {pending ? "Создание…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="auth__footer muted">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
