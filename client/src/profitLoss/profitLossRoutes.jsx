// ==============================================
// client/src/profitLoss/profitLossRoutes.jsx
// ==============================================
// Just one route. Tab switching inside the module is handled entirely by
// ProfitLossLayout's local state — see the comment at the top of that file
// for why nested <Route>-per-tab was removed.

import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import ProfitLossLayout from "./ProfitLossLayout";

// Owner/Admin/Manager can all reach this page; ProfitLossLayout itself
// narrows down which *tabs* Manager sees (summary-only), matching the
// backend's SUMMARY_ACCESS vs FULL_ACCESS route split.
const ProfitLossRoutes = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN", "MANAGER"]} />
        }
      >
        <Route index element={<ProfitLossLayout />} />
      </Route>
    </Routes>
  );
};

export default ProfitLossRoutes;
