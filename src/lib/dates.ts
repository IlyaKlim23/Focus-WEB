/** Локальная дата в формате yyyy-MM-dd */
export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayYmd(): string {
  return toYmd(new Date());
}

/** Начало календарного дня в локальной TZ → ISO для API */
export function ymdToIsoStartOfDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) throw new Error("Неверная дата");
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

export function formatRuDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
