// ==============================================
// src/auth/RoleGuard.jsx
// ==============================================

import React from "react";
import { useAuth } from "./AuthContext";

/**
 * ----------------------------------------------
 * RoleGuard
 * ----------------------------------------------
 *
 * Usage:
 *
 * <RoleGuard roles={["OWNER"]}>
 *    <DeleteButton />
 * </RoleGuard>
 *
 *
 * <RoleGuard roles={["OWNER","MANAGER"]}>
 *    <Reports />
 * </RoleGuard>
 *
 */

const RoleGuard = ({ roles = [], children, fallback = null }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return null;
  }

  // -----------------------------
  // Not Logged In
  // -----------------------------

  if (!isAuthenticated) {
    return fallback;
  }

  // -----------------------------
  // No Roles Passed
  // -----------------------------

  if (!roles.length) {
    return children;
  }

  // -----------------------------
  // Role Check
  // -----------------------------

  const hasPermission = roles.includes(user?.role);

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

// ==============================================
// Helper Components
// ==============================================

export const OwnerOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={["OWNER"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ManagerOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={["MANAGER"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const CashierOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={["CASHIER"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const KitchenOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={["KITCHEN"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const OwnerManager = ({ children, fallback = null }) => (
  <RoleGuard roles={["OWNER", "MANAGER"]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const StaffOnly = ({ children, fallback = null }) => (
  <RoleGuard
    roles={["OWNER", "MANAGER", "CASHIER", "KITCHEN"]}
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

export default RoleGuard;
