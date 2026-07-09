// server/src/employees/employees.routes.js
import { Router } from "express";
import * as employeesController from "./employees.controller.js";
import attendanceRoutes from "./attendance/attendance.routes.js";
import shiftsRoutes from "./shifts/shifts.routes.js";
import leavesRoutes from "./leaves/leaves.routes.js";
import payrollRoutes from "./payroll/payroll.routes.js";
import incentivesRoutes from "./incentives/incentives.routes.js";
import performanceRoutes from "./performance/performance.routes.js";
import activityLogsRoutes from "./activity-logs/activityLogs.routes.js";

const router = Router();

// Mounted with no auth for now — role guards get added here later
router.get("/dashboard", employeesController.getDashboard);

// CHANGED: sub-domain routers must be registered BEFORE the generic "/:id"
// route below. Express matches routes in registration order, and "/:id"
// would otherwise greedily match paths like "/attendance", "/leaves",
// "/payroll" etc. (treating "attendance" as an :id value) and shadow these
// routers entirely, causing 404s on every GET to a sub-domain's list route.
router.use("/attendance", attendanceRoutes);
router.use("/shifts", shiftsRoutes);
router.use("/leaves", leavesRoutes);
router.use("/payroll", payrollRoutes);
router.use("/incentives", incentivesRoutes);
router.use("/performance", performanceRoutes);
router.use("/activity-logs", activityLogsRoutes);

router.get("/", employeesController.getEmployees);
router.get("/:id", employeesController.getEmployee);
router.post("/", employeesController.createEmployee);
router.put("/:id", employeesController.updateEmployee);
router.delete("/:id", employeesController.deleteEmployee);
router.post("/:id/account", employeesController.createLoginAccount);

export default router;
