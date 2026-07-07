// ==============================================
// src/kiosk/kioskRoutes.jsx
// ==============================================

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import IdleScreen from "./components/IdleScreen";
import KioskHome from "./KioskHome";
import KioskCheckout from "./KioskCheckout";
import KioskPayment from "./KioskPayment";
import KioskSuccess from "./KioskSuccess";

const KioskRoutes = () => {
  return (
    <Routes>
      {/* Default */}
      <Route index element={<Navigate to="home" replace />} />

      {/* Main Kiosk */}
      <Route path="home" element={<KioskHome />} />

      {/* Optional Direct Routes (Mainly for Development & Testing) */}
      <Route path="idle" element={<IdleScreen />} />

      <Route path="checkout" element={<KioskCheckout open={true} />} />

      <Route path="payment" element={<KioskPayment open={true} />} />

      <Route path="success" element={<KioskSuccess open={true} />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
};

export default KioskRoutes;
