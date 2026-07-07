// server/src/pos/discounts/discounts.service.js
import prisma from "../../config/prisma.js";

export async function listDiscounts({ isActive } = {}) {
  return prisma.discount.findMany({
    where: isActive !== undefined ? { isActive: isActive === "true" } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getDiscountById(id) {
  return prisma.discount.findUnique({ where: { id } });
}

export async function createDiscount(payload) {
  return prisma.discount.create({ data: payload });
}

export async function updateDiscount(id, payload) {
  return prisma.discount.update({ where: { id }, data: payload });
}

export async function deleteDiscount(id) {
  return prisma.discount.update({ where: { id }, data: { isActive: false } });
}

function computeDiscountAmount(discount, subtotal) {
  if (discount.type === "PERCENTAGE") return (subtotal * Number(discount.value)) / 100;
  return Number(discount.value); // FIXED_AMOUNT, COUPON, MEMBERSHIP all carry a flat value
}

// Applies a catalog discount (by code or id) to an order, or records a MANUAL
// discount that requires an approving employee (role-gated at the route/controller level).
export async function applyDiscountToOrder(orderId, { discountId, code, type, amount, reason, approvedById }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  let amountDeducted = amount;
  let resolvedDiscountId = discountId;
  let resolvedType = type;

  if (discountId || code) {
    const discount = discountId
      ? await prisma.discount.findUnique({ where: { id: discountId } })
      : await prisma.discount.findUnique({ where: { code } });

    if (!discount || !discount.isActive) throw new Error("Discount not found or inactive");
    if (discount.minOrderAmount && Number(order.subtotal) < Number(discount.minOrderAmount)) {
      throw new Error(`Order subtotal must be at least ${discount.minOrderAmount} for this discount`);
    }

    amountDeducted = computeDiscountAmount(discount, Number(order.subtotal));
    resolvedDiscountId = discount.id;
    resolvedType = discount.type;
  } else if (type === "MANUAL" && !approvedById) {
    throw new Error("Manual discounts require an approving employee");
  }

  const orderDiscount = await prisma.orderDiscount.create({
    data: {
      orderId,
      discountId: resolvedDiscountId,
      type: resolvedType,
      amountDeducted,
      reason,
      approvedById,
    },
  });

  const newDiscountAmount = Number(order.discountAmount) + Number(amountDeducted);
  const newGrandTotal = Number(order.grandTotal) - Number(amountDeducted);

  await prisma.order.update({
    where: { id: orderId },
    data: { discountAmount: newDiscountAmount, grandTotal: newGrandTotal },
  });

  return orderDiscount;
}