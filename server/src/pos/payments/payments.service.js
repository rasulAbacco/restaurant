// server/src/pos/payments/payments.service.js
import prisma from "../../config/prisma.js";

export async function listPaymentsForOrder(orderId) {
  return prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } });
}

export async function createPayment(orderId, { method, amount, transactionReference, billSplitId }) {
  const payment = await prisma.payment.create({
    data: {
      orderId,
      method,
      amount,
      transactionReference,
      billSplitId,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await syncOrderPaymentStatus(orderId);
  return payment;
}

// Recomputes whether an order is fully paid, partially paid, or unpaid
// by summing all its Payment rows against grandTotal.
async function syncOrderPaymentStatus(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
  const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  let paymentStatus = "UNPAID";
  if (totalPaid >= Number(order.grandTotal)) paymentStatus = "PAID";
  else if (totalPaid > 0) paymentStatus = "PARTIAL";

  // paymentStatus isn't a column on Order in the current schema — surfaced
  // here for the caller to act on (e.g. auto-advance order status) rather
  // than silently writing a field that doesn't exist.
  return { totalPaid, grandTotal: Number(order.grandTotal), paymentStatus };
}

export async function deletePayment(id) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Payment not found");
  await prisma.payment.delete({ where: { id } });
  return syncOrderPaymentStatus(payment.orderId);
}

export { syncOrderPaymentStatus };