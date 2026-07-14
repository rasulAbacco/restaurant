// ==============================================
// server/src/profitLoss/profitLoss.routes.js
// ==============================================
// Mounted in index.js at /api/profit-loss, behind requireAuth only — role
// enforcement happens per-route here so summary vs. detailed access can
// differ within the same module (see Role Permissions in the spec):
//
//   Admin / Owner  -> full access: every endpoint, plus exports
//   Manager        -> summary-only: dashboard, revenue, expenses, charts
//                     (cannot see item/category-level cost breakdowns, tax
//                     liability, discount/refund detail, or export reports —
//                     treated as "sensitive accounting configuration")
//
// requireRole("OWNER", "MANAGER", ...) already exists in auth.middleware.js
// and is reused as-is.

import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import * as ctrl from "./profitLoss.controller.js";

const router = Router();

const FULL_ACCESS = requireRole("OWNER", "ADMIN");
const SUMMARY_ACCESS = requireRole("OWNER", "ADMIN", "MANAGER");

// ---- Summary-level (Owner/Admin/Manager) ----------------------------------
router.get("/dashboard", SUMMARY_ACCESS, ctrl.getDashboard);
router.get("/revenue", SUMMARY_ACCESS, ctrl.getRevenue);
router.get("/expenses", SUMMARY_ACCESS, ctrl.getExpenses);
router.get("/charts", SUMMARY_ACCESS, ctrl.getCharts);

// ---- Detailed / sensitive (Owner/Admin only) ------------------------------
router.get("/cogs", FULL_ACCESS, ctrl.getCogs);
router.get("/category-profit", FULL_ACCESS, ctrl.getCategoryProfit);
router.get("/item-profit", FULL_ACCESS, ctrl.getItemProfit);
router.get("/food-cost", FULL_ACCESS, ctrl.getFoodCost);
router.get("/discounts", FULL_ACCESS, ctrl.getDiscounts);
router.get("/refunds", FULL_ACCESS, ctrl.getRefunds);
router.get("/tax", FULL_ACCESS, ctrl.getTax);
router.get("/payment-revenue", FULL_ACCESS, ctrl.getPaymentRevenue);
router.get("/inventory-cost", FULL_ACCESS, ctrl.getInventoryCost);
router.get("/wastage", FULL_ACCESS, ctrl.getWastage);
router.get("/reports", FULL_ACCESS, ctrl.getReports);
router.get("/alerts", FULL_ACCESS, ctrl.getAlerts);

export default router;
