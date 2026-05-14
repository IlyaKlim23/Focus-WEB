import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { DeveloperRoute } from "./components/DeveloperRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DeveloperAnalyticsPage } from "./pages/DeveloperAnalyticsPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotesPage } from "./pages/NotesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { QuestionnairesPage } from "./pages/QuestionnairesPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SchedulePage } from "./pages/SchedulePage";
import { TasksPage } from "./pages/TasksPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/questionnaires" element={<QuestionnairesPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route element={<DeveloperRoute />}>
            <Route path="/developer/analytics" element={<DeveloperAnalyticsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
