// server/src/pos/tables/tables.service.js
//
// All data-access logic for floors, tables, and waiter-table assignment.
// Pure functions — no req/res here — so they can be reused by the
// controller, dashboard, reports, etc.
//
// WAITER ASSIGNMENT MODEL
// ------------------------------------------------------------------
// A table can be assigned to at most one waiter at a time (RestaurantTable
// .waiterId). Owner/Admin/Manager assign tables individually, by whole
// floor, or "all tables" in one go. A waiter's own view (getMyTables /
// getMyTableDetail) is always scoped to tables where waiterId === their
// own employee id — they never see other tables' orders/payments.
// ------------------------------------------------------------------

import prisma from "../../config/prisma.js";

const DEFAULT_STORE = "Main Store";

const WAITER_TABLE_SELECT = {
  id: true,
  name: true,
  capacity: true,
  section: true,
  status: true,
  store: true,
  floorId: true,
  waiterId: true,
  assignedAt: true,
  floor: { select: { id: true, name: true } },
  waiter: { select: { id: true, fullName: true, employeeCode: true } },
};

// ==============================================
// FLOORS
// ==============================================

export async function listFloors(store = DEFAULT_STORE) {
  return prisma.floor.findMany({
    where: { store },
    orderBy: { createdAt: "asc" },
  });
}

export async function createFloor({ name, store = DEFAULT_STORE }) {
  if (!name || !name.trim()) {
    throw new Error("Floor name is required");
  }
  return prisma.floor.create({ data: { name: name.trim(), store } });
}

export async function updateFloor(id, { name }) {
  if (!name || !name.trim()) {
    throw new Error("Floor name is required");
  }
  return prisma.floor.update({ where: { id }, data: { name: name.trim() } });
}

export async function deleteFloor(id) {
  // Tables under this floor become unassigned (floorId null), not deleted —
  // matches the confirmation copy already shown in the Tables UI.
  await prisma.restaurantTable.updateMany({
    where: { floorId: id },
    data: { floorId: null },
  });
  return prisma.floor.delete({ where: { id } });
}

// ==============================================
// TABLES — CRUD
// ==============================================

export async function listTablesByFloor(floorId) {
  return prisma.restaurantTable.findMany({
    where: { floorId },
    select: WAITER_TABLE_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export async function listAllTables(store = DEFAULT_STORE) {
  return prisma.restaurantTable.findMany({
    where: { store },
    select: WAITER_TABLE_SELECT,
    orderBy: [{ floor: { name: "asc" } }, { createdAt: "asc" }],
  });
}

export async function createTable({
  floorId,
  name,
  capacity,
  status,
  store = DEFAULT_STORE,
}) {
  if (!floorId) throw new Error("floorId is required");
  if (!name || !name.trim()) throw new Error("Table name is required");

  return prisma.restaurantTable.create({
    data: {
      floorId,
      name: name.trim(),
      capacity: capacity ?? null,
      status: status || "FREE",
      store,
    },
    select: WAITER_TABLE_SELECT,
  });
}

export async function updateTable(id, { floorId, name, capacity, status }) {
  return prisma.restaurantTable.update({
    where: { id },
    data: {
      ...(floorId !== undefined ? { floorId } : {}),
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(capacity !== undefined ? { capacity } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    select: WAITER_TABLE_SELECT,
  });
}

export async function deleteTable(id) {
  return prisma.restaurantTable.delete({ where: { id } });
}

// ==============================================
// WAITERS (for the assignment dropdown)
// ==============================================

export async function listWaiters(store = DEFAULT_STORE) {
  const employees = await prisma.employee.findMany({
    where: {
      store,
      status: "ACTIVE",
      userAccount: { role: "WAITER", isActive: true },
    },
    select: {
      id: true,
      fullName: true,
      employeeCode: true,
      photoUrl: true,
      _count: { select: { assignedTables: true } },
    },
    orderBy: { fullName: "asc" },
  });

  return employees.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    employeeCode: e.employeeCode,
    photoUrl: e.photoUrl,
    assignedTableCount: e._count.assignedTables,
  }));
}

// ==============================================
// ASSIGNMENT
// ==============================================

async function assertWaiterExists(waiterId) {
  const waiter = await prisma.employee.findFirst({
    where: { id: waiterId, userAccount: { role: "WAITER" } },
    select: { id: true },
  });
  if (!waiter) {
    throw new Error("Selected employee is not an active waiter");
  }
}

// Assign a specific list of table ids to a waiter.
export async function assignTables({ tableIds, waiterId }) {
  if (!Array.isArray(tableIds) || tableIds.length === 0) {
    throw new Error("tableIds must be a non-empty array");
  }
  await assertWaiterExists(waiterId);

  await prisma.restaurantTable.updateMany({
    where: { id: { in: tableIds } },
    data: { waiterId, assignedAt: new Date() },
  });

  return prisma.restaurantTable.findMany({
    where: { id: { in: tableIds } },
    select: WAITER_TABLE_SELECT,
  });
}

// Assign every table on one floor (e.g. "Ground Floor") to a waiter.
export async function assignFloorToWaiter({ floorId, waiterId }) {
  if (!floorId) throw new Error("floorId is required");
  await assertWaiterExists(waiterId);

  const result = await prisma.restaurantTable.updateMany({
    where: { floorId },
    data: { waiterId, assignedAt: new Date() },
  });

  return { count: result.count };
}

// Assign every table in the store to a single waiter.
export async function assignAllTables({ waiterId, store = DEFAULT_STORE }) {
  await assertWaiterExists(waiterId);

  const result = await prisma.restaurantTable.updateMany({
    where: { store },
    data: { waiterId, assignedAt: new Date() },
  });

  return { count: result.count };
}

// Remove a table's assignment (goes back to unassigned / any-waiter pool).
export async function unassignTable(id) {
  return prisma.restaurantTable.update({
    where: { id },
    data: { waiterId: null, assignedAt: null },
    select: WAITER_TABLE_SELECT,
  });
}

// Remove ALL of a waiter's assignments at once (e.g. before reassigning,
// or when the employee goes off shift / is removed).
export async function unassignAllForWaiter(waiterId) {
  const result = await prisma.restaurantTable.updateMany({
    where: { waiterId },
    data: { waiterId: null, assignedAt: null },
  });
  return { count: result.count };
}

// ==============================================
// WAITER'S OWN VIEW — "My Tables"
// Scoped strictly to tables where waiterId === the logged-in waiter.
// ==============================================

const ACTIVE_ORDER_STATUSES = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "SERVED",
];

export async function getMyTables(waiterId) {
  const tables = await prisma.restaurantTable.findMany({
    where: { waiterId },
    select: {
      id: true,
      name: true,
      capacity: true,
      status: true,
      floor: { select: { id: true, name: true } },
      orders: {
        where: { status: { in: ACTIVE_ORDER_STATUSES } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          grandTotal: true,
          numberOfGuests: true,
          createdAt: true,
          payments: {
            select: { status: true, method: true, amount: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: [{ floor: { name: "asc" } }, { name: "asc" }],
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0] || null;
    const paid = activeOrder
      ? activeOrder.payments.reduce(
          (sum, p) => (p.status === "PAID" ? sum + Number(p.amount) : sum),
          0,
        )
      : 0;
    const paymentStatus = !activeOrder
      ? null
      : paid >= Number(activeOrder.grandTotal)
        ? "PAID"
        : paid > 0
          ? "PARTIALLY_PAID"
          : "UNPAID";

    return {
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      status: t.status,
      floor: t.floor,
      order: activeOrder
        ? {
            id: activeOrder.id,
            orderNumber: activeOrder.orderNumber,
            status: activeOrder.status,
            grandTotal: activeOrder.grandTotal,
            numberOfGuests: activeOrder.numberOfGuests,
            createdAt: activeOrder.createdAt,
            paymentStatus,
            amountPaid: paid,
          }
        : null,
    };
  });
}

// Detail for a single table — order items + full payment history. Callers
// (controller) MUST pass waiterId and verify the table actually belongs to
// them before/along with this call — see assertTableBelongsToWaiter.
export async function getTableDetailForWaiter(tableId, waiterId) {
  const table = await prisma.restaurantTable.findFirst({
    where: { id: tableId, waiterId },
    select: {
      id: true,
      name: true,
      capacity: true,
      status: true,
      floor: { select: { id: true, name: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          numberOfGuests: true,
          subtotal: true,
          discountAmount: true,
          gstAmount: true,
          serviceChargeAmount: true,
          grandTotal: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              notes: true,
              menuItem: { select: { name: true } },
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              method: true,
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
      },
    },
  });

  if (!table) {
    // Either the table doesn't exist, or it isn't assigned to this waiter —
    // same response either way so we don't leak which tables exist.
    return null;
  }

  return table;
}
