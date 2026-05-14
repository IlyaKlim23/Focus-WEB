import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login, user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  if (isReady && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setPending(false);
    }
  }

  async function onResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      await resetPassword({ email: email.trim(), newPassword });
      setInfo("Пароль обновлен, выполните вход");
      setShowReset(false);
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сбросить пароль");
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
          {info ? <div className="banner">{info}</div> : null}
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
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setShowReset((v) => !v)}
          >
            {showReset ? "Скрыть сброс пароля" : "Сброс пароля"}
          </button>
        </form>
        {showReset ? (
          <form className="stack" onSubmit={onResetPassword}>
            <label className="field">
              <span className="field__label">Новый пароль</span>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <button className="btn btn--primary" type="submit" disabled={pending}>
              {pending ? "Сброс…" : "Подтвердить сброс"}
            </button>
          </form>
        ) : null}
        <p className="auth__footer muted">
          Нет аккаунта? <Link to="/register">Регистрация</Link>
        </p>
      </div>
    </div>
  );
}
