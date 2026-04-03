import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  hasToken,
  login as apiLogin,
  readStoredUser,
  register as apiRegister,
} from "../api/auth";
import type { LoginBody, RegisterBody } from "../types/api";
import type { StoredUser } from "../api/client";

type AuthContextValue = {
  user: StoredUser | null;
  isReady: boolean;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasToken()) {
      setUser(readStoredUser());
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      navigate("/login", { replace: true });
    };
    window.addEventListener("focus:unauthorized", onUnauthorized);
    return () => window.removeEventListener("focus:unauthorized", onUnauthorized);
  }, [navigate]);

  const login = useCallback(async (body: LoginBody) => {
    const res = await apiLogin(body);
    setUser({
      userId: res.userId,
      email: res.email,
      displayName: res.displayName,
    });
    navigate("/", { replace: true });
  }, [navigate]);

  const register = useCallback(async (body: RegisterBody) => {
    const res = await apiRegister(body);
    setUser({
      userId: res.userId,
      email: res.email,
      displayName: res.displayName,
    });
    navigate("/", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isReady,
      login,
      register,
      logout,
    }),
    [user, isReady, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth вне AuthProvider");
  return ctx;
}
