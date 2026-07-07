// server/src/pos/delivery-partners/deliveryPartners.service.js
import prisma from "../../config/prisma.js";

export async function listDeliveryPartners({ isActive } = {}) {
  return prisma.deliveryPartner.findMany({
    where: isActive !== undefined ? { isActive: isActive === "true" } : {},
    orderBy: { name: "asc" },
  });
}

export async function getDeliveryPartnerById(id) {
  return prisma.deliveryPartner.findUnique({ where: { id }, include: { orders: { take: 20, orderBy: { createdAt: "desc" } } } });
}

export async function createDeliveryPartner(payload) {
  return prisma.deliveryPartner.create({ data: payload });
}

export async function updateDeliveryPartner(id, payload) {
  return prisma.deliveryPartner.update({ where: { id }, data: payload });
}

export async function deleteDeliveryPartner(id) {
  return prisma.deliveryPartner.update({ where: { id }, data: { isActive: false } });
}