// server/src/pos/tables/tables.service.js
import prisma from "../../config/prisma.js";

export async function listTables({ status, section, store }) {
  return prisma.restaurantTable.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(section ? { section } : {}),
      ...(store ? { store } : {}),
    },
    include: { orders: { where: { status: { notIn: ["COMPLETED", "CANCELLED", "REFUNDED"] } } } },
    orderBy: { name: "asc" },
  });
}

export async function getTableById(id) {
  return prisma.restaurantTable.findUnique({
    where: { id },
    include: { orders: { where: { status: { notIn: ["COMPLETED", "CANCELLED", "REFUNDED"] } } } },
  });
}

export async function createTable(payload) {
  return prisma.restaurantTable.create({ data: payload });
}

export async function updateTable(id, payload) {
  return prisma.restaurantTable.update({ where: { id }, data: payload });
}

export async function deleteTable(id) {
  return prisma.restaurantTable.delete({ where: { id } });
}

// Merges the source table's active order into the target table, freeing the source.
export async function mergeTables(sourceTableId, targetTableId) {
  const sourceOrder = await prisma.order.findFirst({
    where: { tableId: sourceTableId, status: { notIn: ["COMPLETED", "CANCELLED", "REFUNDED"] } },
  });
  if (!sourceOrder) throw new Error("No active order on source table");

  await prisma.order.update({ where: { id: sourceOrder.id }, data: { tableId: targetTableId } });
  await prisma.restaurantTable.update({ where: { id: sourceTableId }, data: { status: "FREE" } });
  await prisma.restaurantTable.update({ where: { id: targetTableId }, data: { status: "OCCUPIED" } });

  return prisma.order.findUnique({ where: { id: sourceOrder.id }, include: { items: true } });
}