// server/src/employees/employees.service.js
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

/**
 * Generates the next sequential employee code, e.g. EMP-0001, EMP-0002.
 * NOTE: simple count-based approach — fine for single-writer admin usage.
 * If concurrent creation becomes an issue, switch to a DB sequence.
 */
async function generateEmployeeCode() {
  const count = await prisma.employee.count();
  const next = count + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

// FIX: <input type="date"> sends a date-only string like "2026-07-21".
// Prisma's query engine (unlike the plain JS `Date` constructor) requires a
// full ISO-8601 DateTime and throws "premature end of input. Expected
// ISO-8601 DateTime." on a bare date string — this is what was causing
// every Add Employee submission with a Date of Birth / Joining Date to
// 400. Converting to a real Date object here fixes it for both fields,
// for both create and update, without the frontend needing to change.
//
//   - undefined -> undefined  (field simply not included in the update)
//   - null / "" -> null       (explicitly clear the field, e.g. optional dob)
//   - otherwise -> a Date instance, or we throw a friendly error
function toDateTimeOrNull(value, fieldLabel) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`"${fieldLabel}" is not a valid date.`);
  }
  return date;
}

// Applies the date coercion above to whichever of dob / joiningDate are
// present in the payload, leaving every other field untouched.
function normalizeEmployeeDates(employeeData) {
  const normalized = { ...employeeData };

  if ("dob" in normalized) {
    normalized.dob = toDateTimeOrNull(normalized.dob, "Date of Birth");
  }
  if ("joiningDate" in normalized) {
    normalized.joiningDate = toDateTimeOrNull(
      normalized.joiningDate,
      "Joining Date",
    );
  }

  return normalized;
}

export async function listEmployees({
  search,
  department,
  designation,
  status,
  page = 1,
  limit = 20,
}) {
  const where = {
    // CHANGED: when no status filter is supplied, hide TERMINATED (soft-deleted)
    // employees by default instead of showing every record ever created.
    // Callers can still pass status=TERMINATED explicitly to see them.
    ...(status ? { status } : { status: { not: "TERMINATED" } }),
    ...(department ? { department } : {}),
    ...(designation ? { designation } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { employeeCode: { contains: search, mode: "insensitive" } },
            // CHANGED: search now also matches mobile and email so the
            // admin UI's single search box actually finds people by contact info.
            { mobile: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        address: true,
        userAccount: { select: { username: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.employee.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

export async function getEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      address: true,
      userAccount: {
        select: {
          username: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
        },
      },
    },
  });
}

export async function createEmployee(payload) {
  const { address, ...rest } = payload;
  const employeeData = normalizeEmployeeDates(rest);
  const employeeCode = await generateEmployeeCode();

  try {
    return await prisma.employee.create({
      data: {
        ...employeeData,
        employeeCode,
        ...(address
          ? {
              address: { create: address },
            }
          : {}),
      },
      include: { address: true },
    });
  } catch (err) {
    // CHANGED: surface a friendly message instead of a raw Prisma error
    // (e.g. duplicate email, which is @unique on Employee).
    if (err.code === "P2002") {
      const field = err.meta?.target?.join(", ") || "field";
      throw new Error(`An employee with this ${field} already exists.`);
    }
    throw err;
  }
}

export async function updateEmployee(id, payload) {
  const { address, ...rest } = payload;
  const employeeData = normalizeEmployeeDates(rest);

  try {
    return await prisma.employee.update({
      where: { id },
      data: {
        ...employeeData,
        ...(address
          ? {
              address: {
                upsert: {
                  create: address,
                  update: address,
                },
              },
            }
          : {}),
      },
      include: { address: true },
    });
  } catch (err) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.join(", ") || "field";
      throw new Error(`Another employee already uses this ${field}.`);
    }
    if (err.code === "P2025") {
      throw new Error("Employee not found.");
    }
    throw err;
  }
}

export async function deleteEmployee(id) {
  // Soft-delete preferred over hard delete so history (attendance, salary, etc.) isn't orphaned.
  try {
    return await prisma.employee.update({
      where: { id },
      data: { status: "TERMINATED" },
    });
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error("Employee not found.");
    }
    throw err;
  }
}

export async function createLoginAccount(
  employeeId,
  { username, email, password, pin, role },
) {
  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.userAccount.create({
      data: { employeeId, username, email, passwordHash, pin, role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  } catch (err) {
    // CHANGED: friendly message for duplicate username/email or an employee
    // that already has an account (employeeId is @unique on UserAccount),
    // instead of leaking the raw Prisma constraint error to the client.
    if (err.code === "P2002") {
      const field = err.meta?.target?.join(", ") || "value";
      throw new Error(
        `This ${field} is already in use. Please choose a different one.`,
      );
    }
    throw err;
  }
}

export async function getDashboardStats() {
  // CHANGED: use a UTC-anchored "today" (matching attendance.service's
  // startOfDay) instead of setHours(0,0,0,0), which uses the server's local
  // timezone and no longer matches how Attendance.date (a @db.Date column)
  // actually gets stored once startOfDay is UTC-based.
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const [total, present, absent, onLeave, pendingLeaveRequests] =
    await Promise.all([
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date: today, status: "ABSENT" } }),
      prisma.attendance.count({ where: { date: today, status: "LEAVE" } }),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    ]);

  return {
    totalEmployees: total,
    presentToday: present,
    absentToday: absent,
    onLeaveToday: onLeave,
    pendingLeaveRequests,
  };
}
