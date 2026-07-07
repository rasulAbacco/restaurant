// server/src/pos/bill-splits/billSplits.service.js
import prisma from "../../config/prisma.js";

export async function listSplitsForOrder(orderId) {
  return prisma.billSplit.findMany({ where: { orderId }, include: { payments: true } });
}

// splits: [{ label, amount }] for EQUAL/CUSTOM, or [{ label, amount, orderItemIds }] for ITEM_WISE
// (item-wise amount is expected pre-computed by the client from selected OrderItem totals).
export async function createSplits(orderId, { splitType, splits }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const total = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  if (Math.abs(total - Number(order.grandTotal)) > 0.01) {
    throw new Error(`Split amounts (${total}) must add up to the order grand total (${order.grandTotal})`);
  }

  return prisma.$transaction(
    splits.map((s) =>
      prisma.billSplit.create({
        data: { orderId, splitType, label: s.label, amount: s.amount },
      })
    )
  );
}

export async function deleteSplit(id) {
  return prisma.billSplit.delete({ where: { id } });
}