// src/reports/reports.routes.js
// ==============================================
// Reports Routes
// Mount in your main app with:
//   const reportsRoutes = require("./reports/reports.routes");
//   app.use("/api/reports", reportsRoutes);
//
// If you have auth middleware, add it here, e.g.:
//   const { requireAuth, requireRole } = require("../middleware/auth");
//   router.use(requireAuth, requireRole(["OWNER", "ADMIN", "MANAGER"]));
// ==============================================

import express from "express";
import reportsController from "./reports.controller.js";

const router = express.Router();

// Combined payload for the dashboard (one call, all sections)
router.get("/dashboard", reportsController.getDashboard);

// Individual sections (useful for lazy-loading / refreshing one widget)
router.get("/summary", reportsController.getSummary);
router.get("/sales-trend", reportsController.getSalesTrend);
router.get("/order-type-breakdown", reportsController.getOrderTypeBreakdown);
router.get("/category-performance", reportsController.getCategoryPerformance);
router.get("/payment-distribution", reportsController.getPaymentDistribution);
router.get("/top-selling-items", reportsController.getTopSellingItems);
router.get("/expense-breakdown", reportsController.getExpenseBreakdown);
router.get("/employee-performance", reportsController.getEmployeePerformance);
router.get("/customer-analytics", reportsController.getCustomerAnalytics);
router.get("/inventory-alerts", reportsController.getInventoryAlerts);
router.get("/kitchen-performance", reportsController.getKitchenPerformance);
router.get("/transactions", reportsController.getTransactions);

// Export: /api/reports/export/top-selling?format=csv&period=thismonth
router.get("/export/:reportType", reportsController.exportReport);

export default router;
