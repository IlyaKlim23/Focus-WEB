import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ApiError } from "../api/client";
import {
  fetchNotificationSettings,
  saveNotificationSettings,
} from "../api/notifications";

export function NotificationsPage() {
  const [email, setEmail] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState(60);
  const [unavailableFrom, setUnavailableFrom] = useState("22:00");
  const [unavailableTo, setUnavailableTo] = useState("06:00");
  const [hasUnavailableWindow, setHasUnavailableWindow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["notification-settings"] as const,
    queryFn: fetchNotificationSettings,
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setEmail(settingsQuery.data.email);
    setIsEnabled(settingsQuery.data.isEnabled);
    setRemindBeforeMinutes(settingsQuery.data.remindBeforeMinutes);
    if (
      typeof settingsQuery.data.unavailableFromMinutes === "number" &&
      typeof settingsQuery.data.unavailableToMinutes === "number"
    ) {
      setHasUnavailableWindow(true);
      setUnavailableFrom(minutesToTime(settingsQuery.data.unavailableFromMinutes));
      setUnavailableTo(minutesToTime(settingsQuery.data.unavailableToMinutes));
    } else {
      setHasUnavailableWindow(false);
    }
  }, [settingsQuery.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      saveNotificationSettings({
        email: email.trim(),
        isEnabled,
        remindBeforeMinutes,
        unavailableFromMinutes: hasUnavailableWindow
          ? timeToMinutes(unavailableFrom)
          : null,
        unavailableToMinutes: hasUnavailableWindow ? timeToMinutes(unavailableTo) : null,
      }),
    onSuccess: () => {
      setError(null);
      setOk("Настройки сохранены");
    },
    onError: (e: unknown) => {
      setOk(null);
      setError(e instanceof ApiError ? e.message : "Не удалось сохранить");
    },
  });

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Оповещения</h1>
        <p className="muted">Письма приходят за заданное время до дедлайна задачи.</p>
      </header>
      <section className="card stack">
        {settingsQuery.isLoading ? <p className="muted">Загрузка…</p> : null}
        {error ? <div className="banner banner--error">{error}</div> : null}
        {ok ? <div className="banner">{ok}</div> : null}
        <label className="field">
          <span className="field__label">Email для оповещений</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </label>
        <label className="field field--inline">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <span className="field__label">Включить оповещения</span>
        </label>
        <label className="field">
          <span className="field__label">За сколько минут напоминать</span>
          <input
            className="input"
            type="number"
            min={5}
            max={1440}
            value={remindBeforeMinutes}
            onChange={(e) => setRemindBeforeMinutes(Number(e.target.value) || 60)}
          />
        </label>
        <label className="field field--inline">
          <input
            type="checkbox"
            checked={hasUnavailableWindow}
            onChange={(e) => setHasUnavailableWindow(e.target.checked)}
          />
          <span className="field__label">
            Учитывать время, когда я недоступен(на) для задач
          </span>
        </label>
        {hasUnavailableWindow ? (
          <div className="grid">
            <label className="field">
              <span className="field__label">Недоступен с</span>
              <input
                className="input"
                type="time"
                value={unavailableFrom}
                onChange={(e) => setUnavailableFrom(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Недоступен до</span>
              <input
                className="input"
                type="time"
                value={unavailableTo}
                onChange={(e) => setUnavailableTo(e.target.value)}
              />
            </label>
          </div>
        ) : null}
        <button
          type="button"
          className="btn btn--primary"
          disabled={saveMut.isPending || !email.trim()}
          onClick={() => saveMut.mutate()}
        >
          {saveMut.isPending ? "Сохранение…" : "Сохранить"}
        </button>
      </section>
    </div>
  );
}

function timeToMinutes(value: string): number {
  const [hour, minute] = value.split(":").map((x) => Number(x) || 0);
  return Math.min(1439, Math.max(0, hour * 60 + minute));
}

function minutesToTime(minutes: number): string {
  const safe = Math.min(1439, Math.max(0, minutes));
  const hour = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const minute = (safe % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}
