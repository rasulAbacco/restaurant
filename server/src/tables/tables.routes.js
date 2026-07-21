// server/src/pos/tables/tables.routes.js
//
// Mounted at /api/pos/tables (index.js -> pos.routes.js -> here). index.js
// already applies requireAuth + requireRole("OWNER","ADMIN","MANAGER",
// "CASHIER","WAITER") at the /api/pos mount, so req.user is guaranteed to
// exist for every route below — these requireRole() calls just narrow it
// further per-route.
//
// ROLE RULES
// - Floor / table management (create/edit/delete)  -> OWNER, ADMIN, MANAGER
// - Browse all floors/tables, waiter list           -> OWNER, ADMIN, MANAGER, CASHIER
// - Assign / unassign tables to a waiter            -> OWNER, ADMIN, MANAGER
// - "My Tables" (own assigned tables only)          -> WAITER
import { Router } from "express";
import * as controller from "./tables.controller.js";
import { requireRole } from "../../auth/auth.middleware.js";

const MANAGE_ROLES = ["OWNER", "ADMIN", "MANAGER"];
const BROWSE_ROLES = ["OWNER", "ADMIN", "MANAGER", "CASHIER"];

const router = Router();

// ---------- Waiter's own view (must come before the generic /:id-style
// routes further down so "my-tables" is never swallowed as a param) ----------
router.get("/my-tables", requireRole("WAITER"), controller.getMyTables);
router.get(
  "/my-tables/:id",
  requireRole("WAITER"),
  controller.getMyTableDetail,
);

// ---------- Waiters list (for the assignment dropdown) ----------
router.get("/waiters", requireRole(...MANAGE_ROLES), controller.getWaiters);

// ---------- Assignment ----------
router.post("/assign", requireRole(...MANAGE_ROLES), controller.assignTables);
router.post(
  "/assign/floor",
  requireRole(...MANAGE_ROLES),
  controller.assignFloor,
);
router.post("/assign/all", requireRole(...MANAGE_ROLES), controller.assignAll);
router.post(
  "/unassign/:id",
  requireRole(...MANAGE_ROLES),
  controller.unassignTable,
);
router.post(
  "/waiters/:waiterId/unassign-all",
  requireRole(...MANAGE_ROLES),
  controller.unassignAllForWaiter,
);

// ---------- Floors ----------
router.get("/floors", requireRole(...BROWSE_ROLES), controller.getFloors);
router.post("/floors", requireRole(...MANAGE_ROLES), controller.createFloor);
router.put("/floors/:id", requireRole(...MANAGE_ROLES), controller.updateFloor);
router.delete(
  "/floors/:id",
  requireRole(...MANAGE_ROLES),
  controller.deleteFloor,
);

// ---------- Tables: core CRUD ----------
router.get("/", requireRole(...BROWSE_ROLES), controller.getTables);
router.post("/", requireRole(...MANAGE_ROLES), controller.createTable);
router.put("/:id", requireRole(...MANAGE_ROLES), controller.updateTable);
router.delete("/:id", requireRole(...MANAGE_ROLES), controller.deleteTable);

export default router;
