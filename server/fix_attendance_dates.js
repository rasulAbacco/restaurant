// One-off repair script for the timezone bug in attendance.service.js.
//
// The old startOfDay() used local setHours(0,0,0,0), which — on a server
// running ahead of UTC (e.g. IST, +5:30) — silently stored each day's
// Attendance.date one calendar day EARLIER than intended (since Attendance.date
// is a @db.Date column and Prisma writes it using the UTC date part).
//
// This script finds attendance rows where clockIn happened "today" (or on any
// date) but the `date` column doesn't match the calendar day clockIn actually
// happened on, and corrects `date` to line up. Safe to run multiple times.
//
// Usage:
//   node fix_attendance_dates.js            # dry run, prints what it would change
//   node fix_attendance_dates.js --apply    # actually applies the fix

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Same UTC-anchored boundary as the fixed startOfDay() in attendance.service.js
function correctDateFor(timestamp) {
  const d = new Date(timestamp);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

async function main() {
  const rows = await prisma.attendance.findMany({
    where: { clockIn: { not: null } },
    select: { id: true, employeeId: true, date: true, clockIn: true },
  });

  const mismatches = rows.filter((r) => {
    const correct = correctDateFor(r.clockIn);
    return correct.getTime() !== new Date(r.date).getTime();
  });

  if (mismatches.length === 0) {
    console.log("No mismatched attendance rows found. Nothing to fix.");
    return;
  }

  console.log(`Found ${mismatches.length} row(s) with an incorrect date:\n`);

  for (const r of mismatches) {
    const correct = correctDateFor(r.clockIn);
    console.log(
      `  employeeId=${r.employeeId}  clockIn=${new Date(r.clockIn).toISOString()}  ` +
        `stored date=${new Date(r.date).toISOString().slice(0, 10)}  -> correct date=${correct
          .toISOString()
          .slice(0, 10)}`,
    );
  }

  if (!APPLY) {
    console.log(
      "\nDry run only — no changes made. Re-run with --apply to update these rows.",
    );
    return;
  }

  for (const r of mismatches) {
    const correct = correctDateFor(r.clockIn);

    // Guard against the unique(employeeId, date) constraint: if a row already
    // exists for that employee on the corrected date, merge instead of
    // creating a duplicate-key error.
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: r.employeeId, date: correct } },
    });

    if (existing && existing.id !== r.id) {
      console.log(
        `  Skipping ${r.id}: a row already exists for employee ${r.employeeId} on the corrected date (${existing.id}). Resolve this pair manually.`,
      );
      continue;
    }

    await prisma.attendance.update({
      where: { id: r.id },
      data: { date: correct },
    });
  }

  console.log(`\nApplied fix to ${mismatches.length} row(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
