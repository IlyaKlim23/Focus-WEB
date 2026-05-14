import type { AuthResponse } from "../types/api";

export const STORAGE_TOKEN_KEY = "focus_access_token";
export const STORAGE_USER_KEY = "focus_user";

export type StoredUser = Pick<AuthResponse, "userId" | "email" | "displayName" | "role">;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  const base = raw && raw.length > 0 ? raw : "/api/v1";
  return base.replace(/\/$/, "");
}

async function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const data: unknown = await res.json();
      if (typeof data === "string") return data;
      if (data && typeof data === "object" && "message" in data) {
        const m = (data as { message?: unknown }).message;
        if (typeof m === "string") return m;
      }
      if (data && typeof data === "object" && "title" in data) {
        const t = (data as { title?: unknown }).title;
        if (typeof t === "string") return t;
      }
    } catch {
      /* fall through */
    }
  }
  const text = await res.text();
  return text.trim() || res.statusText || "Ошибка запроса";
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (token && !init.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && !init.skipAuth) {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    window.dispatchEvent(new CustomEvent("focus:unauthorized"));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res));
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
