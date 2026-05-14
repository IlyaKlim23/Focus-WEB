import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function DeveloperRoute() {
  const { user } = useAuth();
  if (user?.role !== "Developer") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
