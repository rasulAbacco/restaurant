// server/src/pos/add-ons/addOns.service.js
import prisma from "../../config/prisma.js";

export async function listAddOns({ isEnabled } = {}) {
  return prisma.addOn.findMany({
    where: isEnabled !== undefined ? { isEnabled: isEnabled === "true" } : {},
    orderBy: { name: "asc" },
  });
}

export async function getAddOnById(id) {
  return prisma.addOn.findUnique({ where: { id } });
}

export async function createAddOn(payload) {
  return prisma.addOn.create({ data: payload });
}

export async function updateAddOn(id, payload) {
  return prisma.addOn.update({ where: { id }, data: payload });
}

export async function deleteAddOn(id) {
  // Soft-disable preferred over hard delete so past orders keep their reference.
  return prisma.addOn.update({ where: { id }, data: { isEnabled: false } });
}