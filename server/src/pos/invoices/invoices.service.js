// server/src/pos/invoices/invoices.service.js
import prisma from "../../config/prisma.js";

async function generateInvoiceNumber() {
  const count = await prisma.invoice.count();
  return `INV-${String(count + 1).padStart(6, "0")}`;
}

export async function generateInvoice(orderId, { gstNumber } = {}) {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const invoiceNumber = await generateInvoiceNumber();

  return prisma.invoice.create({
    data: { orderId, invoiceNumber, gstNumber },
  });
}

export async function getInvoiceByOrder(orderId) {
  return prisma.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          items: { include: { menuItem: true, addOns: { include: { addOn: true } } } },
          customer: true,
          table: true,
          payments: true,
          discountsApplied: true,
        },
      },
    },
  });
}

export async function markSent(id, channel) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  const existing = invoice.sentVia ? invoice.sentVia.split(",") : [];
  const sentVia = Array.from(new Set([...existing, channel])).join(",");

  return prisma.invoice.update({ where: { id }, data: { sentVia } });
}