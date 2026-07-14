// src/reports/reports.controller.js
// ==============================================
// Reports Controller
// Thin HTTP layer: parse query -> call service -> shape response.
// All errors are forwarded to next(err) for your centralized error handler.
// ==============================================

import reportsService from "./reports.service.js";

function getFilters(req) {
  return reportsService.parseFilters(req.query);
}

async function getDashboard(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getDashboard(filters);
    res.json({
      success: true,
      filters: { start: filters.start, end: filters.end },
      data,
    });
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const filters = getFilters(req);
    const [summary, inventoryValue] = await Promise.all([
      reportsService.getSalesSummary(filters),
      reportsService.getInventoryValue(),
    ]);
    res.json({ success: true, data: { ...summary, inventoryValue } });
  } catch (err) {
    next(err);
  }
}

async function getSalesTrend(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getSalesTrend(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getOrderTypeBreakdown(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getOrderTypeBreakdown(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getCategoryPerformance(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getCategoryPerformance(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getPaymentDistribution(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getPaymentDistribution(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getTopSellingItems(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getTopSellingItems(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getExpenseBreakdown(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getExpenseBreakdown(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getEmployeePerformance(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getEmployeePerformance(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getCustomerAnalytics(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getCustomerAnalytics(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getInventoryAlerts(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getInventoryAlerts(filters.limit || 20);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getKitchenPerformance(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getKitchenPerformance(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const filters = getFilters(req);
    const data = await reportsService.getRecentTransactions(filters);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// EXPORT
// GET /api/reports/export/:reportType?format=csv|xlsx&...filters
// ─────────────────────────────────────────────

const VALID_REPORT_TYPES = [
  "transactions",
  "top-selling",
  "category-performance",
  "payment-distribution",
  "expense-breakdown",
  "employee-performance",
  "inventory-alerts",
  "sales-trend",
  "order-type-breakdown",
  "customer-analytics",
];

async function exportReport(req, res, next) {
  try {
    const { reportType } = req.params;
    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: `Unknown report type "${reportType}". Valid types: ${VALID_REPORT_TYPES.join(", ")}`,
      });
    }

    const format = (req.query.format || "csv").toLowerCase();
    const filters = getFilters(req);
    const rows = await reportsService.getExportData(reportType, filters);
    const filename = `${reportType}-${new Date().toISOString().slice(0, 10)}`;

    if (format === "xlsx" || format === "excel") {
      const buffer = await reportsService.toExcelBuffer(rows, reportType);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.xlsx"`,
      );
      return res.send(buffer);
    }

    const csv = reportsService.toCSV(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    if (err.statusCode)
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    next(err);
  }
}

export default {
  getDashboard,
  getSummary,
  getSalesTrend,
  getOrderTypeBreakdown,
  getCategoryPerformance,
  getPaymentDistribution,
  getTopSellingItems,
  getExpenseBreakdown,
  getEmployeePerformance,
  getCustomerAnalytics,
  getInventoryAlerts,
  getKitchenPerformance,
  getTransactions,
  exportReport,
};
