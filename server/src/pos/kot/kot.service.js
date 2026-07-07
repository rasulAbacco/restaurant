// server/src/pos/kot/kot.service.js
import prisma from "../../config/prisma.js";

async function generateKotNumber() {
  const count = await prisma.kitchenOrder.count();
  return `KOT-${String(count + 1).padStart(6, "0")}`;
}

// Sends the given OrderItems to the kitchen as one ticket. Called on initial
// order creation, and again whenever items are added to an already-fired order
// (a fresh KOT per "send to kitchen" event, never edited after the fact).
export async function sendToKitchen(orderId, orderItemIds) {
  const kotNumber = await generateKotNumber();

  const orderItems = await prisma.orderItem.findMany({
    where: { id: { in: orderItemIds }, orderId },
  });
  if (orderItems.length === 0) throw new Error("No matching order items to send");

  const kitchenOrder = await prisma.kitchenOrder.create({
    data: {
      orderId,
      kotNumber,
      status: "SENT",
      printedAt: new Date(),
      items: {
        create: orderItems.map((item) => ({ orderItemId: item.id, quantity: item.quantity })),
      },
    },
    include: { items: { include: { orderItem: { include: { menuItem: true } } } } },
  });

  await prisma.order.update({ where: { id: orderId }, data: { status: "ACCEPTED" } });

  return kitchenOrder;
}

export async function listKotsForOrder(orderId) {
  return prisma.kitchenOrder.findMany({
    where: { orderId },
    include: { items: { include: { orderItem: { include: { menuItem: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getActiveKitchenDisplay() {
  // Kitchen display screen — everything not yet READY, oldest first.
  return prisma.kitchenOrder.findMany({
    where: { status: { in: ["SENT", "PREPARING"] } },
    include: {
      order: { select: { orderNumber: true, orderType: true, table: { select: { name: true } } } },
      items: { include: { orderItem: { include: { menuItem: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateKotStatus(id, status) {
  const kot = await prisma.kitchenOrder.update({ where: { id }, data: { status } });

  if (status === "READY") {
    const order = await prisma.order.findUnique({ where: { id: kot.orderId } });
    if (order.status === "PREPARING" || order.status === "ACCEPTED") {
      await prisma.order.update({ where: { id: kot.orderId }, data: { status: "READY" } });
    }
  }

  return kot;
}