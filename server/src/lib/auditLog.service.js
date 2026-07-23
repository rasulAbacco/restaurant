// server/src/lib/auditLog.service.js
//
// Thin wrapper around AuditLog.create(). Deliberately fire-and-forget-safe:
// writeAuditLog() swallows its own errors (logging to console instead of
// throwing) so a logging failure can never block or roll back the real
// action it's describing — e.g. a DB hiccup writing the audit row must
// never prevent an order deletion the Owner explicitly requested.
import prisma from "../config/prisma.js";

/**
 * @param {object} entry
 * @param {string} entry.action - e.g. "ORDER_DELETED"
 * @param {string} entry.entityType - e.g. "Order"
 * @param {string} entry.entityId
 * @param {string|null} [entry.performedById] - Employee.id of the actor
 * @param {string|null} [entry.performedByRole] - role snapshot at the time
 * @param {object} [entry.metadata] - free-form extra detail
 */
export async function writeAuditLog({
  action,
  entityType,
  entityId,
  performedById = null,
  performedByRole = null,
  metadata = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        performedById,
        performedByRole,
        metadata,
      },
    });
  } catch (err) {
    // Deliberately not re-thrown — see file header. Still surfaced to
    // server logs so a persistent audit-logging failure doesn't go
    // completely unnoticed.
    console.error(
      "Failed to write audit log:",
      action,
      entityType,
      entityId,
      err.message,
    );
  }
}

export async function listAuditLogs({
  entityType,
  entityId,
  action,
  page = 1,
  limit = 50,
} = {}) {
  const where = {
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
    ...(action ? { action } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}
