import type { AuthResponse, LoginBody, RegisterBody } from "../types/api";
import { apiRequest, STORAGE_TOKEN_KEY, STORAGE_USER_KEY, type StoredUser } from "./client";

function persistSession(data: AuthResponse) {
  localStorage.setItem(STORAGE_TOKEN_KEY, data.accessToken);
  const user: StoredUser = {
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
  };
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/Auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
  persistSession(data);
  return data;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/Auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
  persistSession(data);
  return data;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
}

export function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function hasToken(): boolean {
  return Boolean(localStorage.getItem(STORAGE_TOKEN_KEY));
}
