// ==============================================
// client/src/App.jsx
// ==============================================

import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import AuthLayout from "./auth/AuthLayout";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import ProtectedRoute from "./auth/ProtectedRoute";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

// Dashboard
import Dashboard from "./dashboard/Dashboard";

// Module Routes
import MenuRoutes from "./menu/menuRoutes";
import PosRoutes from "./pos/posRoutes";
import SettingsRoutes from "./settings/settingsRoutes";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ================= PROTECTED ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Modules */}
          <Route path="/menu/*" element={<MenuRoutes />} />
          <Route path="/pos/*" element={<PosRoutes />} />
          <Route path="/settings/*" element={<SettingsRoutes />} />
        </Route>
      </Route>

      {/* ================= DEFAULT ================= */}

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ================= 404 ================= */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
