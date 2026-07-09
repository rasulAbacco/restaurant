import { Router } from "express";
import * as expenseController from "./expenses.controller.js";
import categoriesRoutes from "./categories/expenseCategories.routes.js";

const router = Router();

// Sub-resources — mount before the generic /:id route below
router.use("/categories", categoriesRoutes);

// Dashboard & reports (must come before "/:id" or "dashboard"/"reports"
// would be swallowed as an :id param)
router.get("/dashboard", expenseController.getDashboard);
router.get("/reports", expenseController.getReports);

// Import / Export — must ALSO come before "/:id" for the same reason,
// otherwise "import"/"export" get swallowed as expense IDs
router.get("/import/template", expenseController.downloadImportTemplate);
router.post("/import/validate", expenseController.uploadMiddleware, expenseController.validateImport);
router.post("/import/confirm", expenseController.confirmImport);
router.get("/export", expenseController.exportExpenses);

// Core expense CRUD
router.get("/", expenseController.getAllExpenses);
router.get("/:id", expenseController.getExpenseById);
router.post("/", expenseController.createExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);
router.post("/:id/approve", expenseController.approveExpense);

export default router;