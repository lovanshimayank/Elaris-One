import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../components/layout/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Notes from "../pages/dashboard/Notes";
import PYQs from "../pages/dashboard/PYQs";
import Opportunities from "../pages/dashboard/Opportunities";
import Bookmarks from "../pages/dashboard/Bookmarks";
import Profile from "../pages/dashboard/Profile";

import AIAssistant from "../pages/ai/AIAssistant";

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/notes"
          element={<Notes />}
        />

        <Route
          path="/pyqs"
          element={<PYQs />}
        />

        <Route
          path="/opportunities"
          element={<Opportunities />}
        />

        <Route
          path="/bookmarks"
          element={<Bookmarks />}
        />

        <Route
          path="/ai"
          element={<AIAssistant />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}