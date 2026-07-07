// ==============================================
// src/auth/AuthLayout.jsx
// ==============================================

import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100">
      {/* Background Decorations */}

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Main Content */}

      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
