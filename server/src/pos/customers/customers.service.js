// server/src/pos/customers/customers.service.js
import prisma from "../../config/prisma.js";

export async function listCustomers({ search, page = 1, limit = 20 }) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.customer.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

// Used by POS search bar — quick lookup by mobile/name while taking an order.
export async function searchCustomers(query) {
  return prisma.customer.findMany({
    where: {
      OR: [
        { mobile: { contains: query } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
}

export async function getCustomerById(id) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      loyaltyTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function createCustomer(payload) {
  return prisma.customer.create({ data: payload });
}

export async function updateCustomer(id, payload) {
  return prisma.customer.update({ where: { id }, data: payload });
}

export async function deleteCustomer(id) {
  return prisma.customer.delete({ where: { id } });
}