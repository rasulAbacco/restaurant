import prisma from "../config/prisma.js";
import ExcelJS from "exceljs";

async function generateExpenseNumber() {
  const count = await prisma.expense.count();
  return `EXP-${String(count + 1).padStart(6, "0")}`;
}

// ==============================================
// EXCEL IMPORT
// ==============================================

const IMPORT_COLUMNS = [
  { header: "Title", key: "title" },
  { header: "Category", key: "categoryName" },
  { header: "Store", key: "store" },
  { header: "Expense Date (YYYY-MM-DD)", key: "expenseDate" },
  { header: "Amount", key: "amount" },
  { header: "GST Amount", key: "gstAmount" },
  { header: "Discount", key: "discount" },
  { header: "Invoice Number", key: "invoiceNumber" },
  { header: "Payment Method (CASH/CARD/UPI/BANK_TRANSFER/CHEQUE/OTHER)", key: "paymentMethod" },
  { header: "Payment Status (UNPAID/PARTIAL/PAID/OVERDUE)", key: "paymentStatus" },
  { header: "Payment Date (YYYY-MM-DD)", key: "paymentDate" },
  { header: "Transaction Reference", key: "transactionReference" },
  { header: "Description", key: "description" },
];

const VALID_PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"];
const VALID_PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "OVERDUE"];

// Builds the downloadable template: an Instructions sheet explaining every
// column (with the real, current category names so people don't guess), and
// a Data sheet with headers + one greyed-out example row.
export const generateImportTemplate = async () => {
  const workbook = new ExcelJS.Workbook();

  const categories = await prisma.expenseCategory.findMany({
    where: { isEnabled: true },
    orderBy: { name: "asc" },
  });
  const categoryNames = categories.map((c) => c.name).join(", ") || "(no categories yet — add one first)";

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [
    { header: "Column", key: "column", width: 42 },
    { header: "Required?", key: "required", width: 12 },
    { header: "What to enter", key: "help", width: 75 },
  ];
  instructions.getRow(1).font = { bold: true };
  instructions.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6F7" } };

  instructions.addRows([
    { column: "Title", required: "Yes", help: "Short name for the expense, e.g. 'June Electricity Bill'." },
    { column: "Category", required: "Yes", help: `Must exactly match an existing category name (case-insensitive). Available: ${categoryNames}` },
    { column: "Store", required: "Yes", help: "Store/branch name exactly as it appears under Stores." },
    { column: "Expense Date", required: "Yes", help: "Format: YYYY-MM-DD, e.g. 2026-07-09." },
    { column: "Amount", required: "Yes", help: "Bill amount before GST/discount. Must be a number greater than 0." },
    { column: "GST Amount", required: "No", help: "Leave blank for 0. This is the GST amount in rupees, not a percentage." },
    { column: "Discount", required: "No", help: "Leave blank for 0." },
    { column: "Invoice Number", required: "No", help: "Supplier's invoice/bill number, if you have one." },
    { column: "Payment Method", required: "No", help: "One of: CASH, CARD, UPI, BANK_TRANSFER, CHEQUE, OTHER." },
    { column: "Payment Status", required: "No", help: "One of: UNPAID, PARTIAL, PAID, OVERDUE. Defaults to UNPAID if left blank." },
    { column: "Payment Date", required: "No*", help: "Format: YYYY-MM-DD. *Required if Payment Status is PAID or PARTIAL." },
    { column: "Transaction Reference", required: "No", help: "UPI reference number or cheque number, if applicable." },
    { column: "Description", required: "No", help: "Any extra notes about this expense." },
  ]);
  instructions.getColumn("help").alignment = { wrapText: true, vertical: "top" };

  const data = workbook.addWorksheet("Data");
  data.columns = IMPORT_COLUMNS.map((c) => ({ header: c.header, key: c.key, width: 26 }));
  data.getRow(1).font = { bold: true };
  data.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6F7" } };

  data.addRow({
    title: "Example: June Electricity Bill",
    categoryName: categories[0]?.name || "Utilities",
    store: "Main Store",
    expenseDate: "2026-06-05",
    amount: 4500,
    gstAmount: 0,
    discount: 0,
    invoiceNumber: "INV-1029",
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    paymentDate: "2026-06-06",
    transactionReference: "UPI123456",
    description: "",
  });
  data.getRow(2).font = { italic: true, color: { argb: "FF999999" } };

  return workbook.xlsx.writeBuffer();
};

const parseExcelDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Reads an uploaded file and validates every row WITHOUT touching the DB.
// Returns { validRows, errorRows } for the frontend preview step.
export const parseImportFile = async (fileBuffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const sheet = workbook.getWorksheet("Data") || workbook.worksheets[0];
  if (!sheet) throw new Error("Could not find a 'Data' sheet in this file");

  const categories = await prisma.expenseCategory.findMany();
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name.trim().toLowerCase(), c]));

  const validRows = [];
  const errorRows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header row

    const values = row.values; // 1-indexed; values[0] is empty
    const isBlank = values.slice(1).every((v) => v === null || v === undefined || v === "");
    if (isBlank) return;

    const record = {};
    IMPORT_COLUMNS.forEach((col, i) => {
      record[col.key] = values[i + 1];
    });

    // skip the shipped example row
    if (typeof record.title === "string" && record.title.startsWith("Example:")) return;

    const errors = [];

    if (!record.title || !String(record.title).trim()) errors.push("Title is required");

    const categoryMatch = record.categoryName
      ? categoryByName[String(record.categoryName).trim().toLowerCase()]
      : null;
    if (!record.categoryName || !String(record.categoryName).trim()) {
      errors.push("Category is required");
    } else if (!categoryMatch) {
      errors.push(`Category "${record.categoryName}" was not found — check spelling against the Instructions sheet`);
    }

    if (!record.store || !String(record.store).trim()) errors.push("Store is required");

    const expenseDate = parseExcelDate(record.expenseDate);
    if (!expenseDate) errors.push("Expense Date is missing or not a valid date (use YYYY-MM-DD)");

    const amount = Number(record.amount);
    if (!record.amount || isNaN(amount) || amount <= 0) errors.push("Amount must be a number greater than 0");

    const gstAmount = record.gstAmount ? Number(record.gstAmount) : 0;
    if (record.gstAmount && isNaN(gstAmount)) errors.push("GST Amount must be a number");

    const discount = record.discount ? Number(record.discount) : 0;
    if (record.discount && isNaN(discount)) errors.push("Discount must be a number");

    const paymentMethod = record.paymentMethod ? String(record.paymentMethod).trim().toUpperCase() : null;
    if (paymentMethod && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      errors.push(`Payment Method "${record.paymentMethod}" is not valid (${VALID_PAYMENT_METHODS.join(", ")})`);
    }

    const paymentStatus = record.paymentStatus ? String(record.paymentStatus).trim().toUpperCase() : "UNPAID";
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      errors.push(`Payment Status "${record.paymentStatus}" is not valid (${VALID_PAYMENT_STATUSES.join(", ")})`);
    }

    const paymentDate = parseExcelDate(record.paymentDate);
    if (["PAID", "PARTIAL"].includes(paymentStatus) && !paymentDate) {
      errors.push("Payment Date is required when Payment Status is PAID or PARTIAL");
    }

    if (errors.length > 0) {
      errorRows.push({ rowNumber, errors });
      return;
    }

    validRows.push({
      rowNumber,
      title: String(record.title).trim(),
      categoryId: categoryMatch.id,
      categoryName: categoryMatch.name,
      store: String(record.store).trim(),
      expenseDate: expenseDate.toISOString(),
      amount,
      gstAmount,
      discount,
      totalPaid: Math.max(0, amount + gstAmount - discount),
      invoiceNumber: record.invoiceNumber ? String(record.invoiceNumber).trim() : null,
      paymentMethod,
      paymentStatus,
      paymentDate: paymentDate ? paymentDate.toISOString() : null,
      transactionReference: record.transactionReference ? String(record.transactionReference).trim() : null,
      description: record.description ? String(record.description).trim() : null,
    });
  });

  return { validRows, errorRows };
};

// Actually creates the expenses. Sequential (not Promise.all) because
// generateExpenseNumber() counts rows — parallel creates would race and
// could hand out duplicate expense numbers.
export const bulkCreateExpenses = async (rows, userId) => {
  const created = [];
  for (const row of rows) {
    const expense = await createExpense(
      {
        title: row.title,
        categoryId: row.categoryId,
        store: row.store,
        expenseDate: row.expenseDate,
        amount: row.amount,
        gstAmount: row.gstAmount,
        discount: row.discount,
        totalPaid: row.totalPaid,
        invoiceNumber: row.invoiceNumber,
        paymentMethod: row.paymentMethod,
        paymentStatus: row.paymentStatus,
        paymentDate: row.paymentDate,
        transactionReference: row.transactionReference,
        description: row.description,
      },
      userId,
    );
    created.push(expense);
  }
  return created;
};

// Called when the user clicks "Confirm Import". Re-checks the rows the
// client already validated (categories/amounts could theoretically have
// changed since the preview) before actually writing anything.
export const confirmImportRows = async (rows, userId) => {
  const categories = await prisma.expenseCategory.findMany();
  const categoryIds = new Set(categories.map((c) => c.id));

  const toCreate = [];
  const skipped = [];

  for (const row of rows) {
    if (!row.categoryId || !categoryIds.has(row.categoryId) || !row.amount || row.amount <= 0 || !row.expenseDate) {
      skipped.push({ rowNumber: row.rowNumber, reason: "No longer valid — please re-upload and preview again" });
      continue;
    }
    toCreate.push(row);
  }

  const created = await bulkCreateExpenses(toCreate, userId);
  return { created, skipped };
};

// ==============================================
// EXCEL EXPORT
// ==============================================

export const exportExpensesToExcel = async (filters = {}) => {
  const expenses = await getAllExpenses(filters);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Expenses");

  sheet.columns = [
    { header: "Expense Number", key: "expenseNumber", width: 16 },
    { header: "Title", key: "title", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Store", key: "store", width: 18 },
    { header: "Expense Date", key: "expenseDate", width: 14 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "GST Amount", key: "gstAmount", width: 12 },
    { header: "Discount", key: "discount", width: 12 },
    { header: "Total Paid", key: "totalPaid", width: 14 },
    { header: "Invoice Number", key: "invoiceNumber", width: 16 },
    { header: "Payment Method", key: "paymentMethod", width: 16 },
    { header: "Payment Status", key: "paymentStatus", width: 14 },
    { header: "Payment Date", key: "paymentDate", width: 14 },
    { header: "Status", key: "status", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6F7" } };

  expenses.forEach((e) => {
    sheet.addRow({
      expenseNumber: e.expenseNumber,
      title: e.title,
      category: e.category?.name || "",
      store: e.store,
      expenseDate: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("en-IN") : "",
      amount: Number(e.amount),
      gstAmount: Number(e.gstAmount),
      discount: Number(e.discount),
      totalPaid: Number(e.totalPaid),
      invoiceNumber: e.invoiceNumber || "",
      paymentMethod: e.paymentMethod || "",
      paymentStatus: e.paymentStatus,
      paymentDate: e.paymentDate ? new Date(e.paymentDate).toLocaleDateString("en-IN") : "",
      status: e.status,
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const getAllExpenses = async (filters = {}) => {
  const { category, status, store, from, to, search } = filters;
  const where = {};

  if (category) where.categoryId = category;
  if (status) where.status = status;
  if (store) where.store = store;
  if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(from);
    if (to) where.expenseDate.lte = new Date(to);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { expenseNumber: { contains: search, mode: "insensitive" } },
      { invoiceNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.expense.findMany({
    where,
    include: { category: true, supplier: true, attachments: true },
    orderBy: { expenseDate: "desc" },
  });
};

export const getExpenseById = (id) =>
  prisma.expense.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
      attachments: true,
      approvals: true,
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });

export const createExpense = async (data, userId) => {
  const expenseNumber = await generateExpenseNumber();

  const expense = await prisma.expense.create({
    data: {
      ...data,
      expenseDate: new Date(data.expenseDate),
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      supplierId: data.supplierId || null,
      invoiceNumber: data.invoiceNumber || null,
      transactionReference: data.transactionReference || null,
      description: data.description || null,
      paymentMethod: data.paymentMethod || null,
      expenseNumber,
      createdBy: userId || null,
    },
  });

  await prisma.expenseAuditLog.create({
    data: {
      expenseId: expense.id,
      action: "CREATE",
      changedBy: userId || null,
      newValue: data,
    },
  });

  return expense;
};

export const updateExpense = async (id, data, userId) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) return null;

  const updated = await prisma.expense.update({ where: { id }, data });

  await prisma.expenseAuditLog.create({
    data: {
      expenseId: id,
      action: "UPDATE",
      changedBy: userId || null,
      oldValue: existing,
      newValue: data,
    },
  });

  return updated;
};

export const deleteExpense = async (id, userId) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) return null;

  if (["APPROVED", "PAID"].includes(existing.status)) {
    throw new Error("Cannot delete an approved or paid expense");
  }

  await prisma.expenseAuditLog.create({
    data: {
      expenseId: id,
      action: "DELETE",
      changedBy: userId || null,
      oldValue: existing,
    },
  });

  return prisma.expense.delete({ where: { id } });
};

export const approveExpense = async (id, { action, level, approverId, comment }) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return null;

  await prisma.expenseApproval.create({
    data: { expenseId: id, action, level, approverId, comment },
  });

  const newStatus = action === "REJECTED" ? "REJECTED" : "APPROVED";

  const updated = await prisma.expense.update({
    where: { id },
    data: { status: newStatus },
  });

  await prisma.expenseAuditLog.create({
    data: {
      expenseId: id,
      action: action === "REJECTED" ? "REJECT" : "APPROVE",
      changedBy: approverId || null,
      oldValue: { status: expense.status },
      newValue: { status: newStatus },
    },
  });

  // Placeholder hook: once the Profit & Loss module exists, an APPROVED
  // expense should push its totalPaid into that period's calculation here.

  return updated;
};

export const getDashboard = async (store) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseWhere = store ? { store } : {};

  const [todayAgg, monthAgg, pendingAgg, paidAgg, unpaidAgg, byCategory, categories] =
    await Promise.all([
      prisma.expense.aggregate({
        where: { ...baseWhere, expenseDate: { gte: startOfToday, lt: endOfToday } },
        _sum: { totalPaid: true },
      }),
      prisma.expense.aggregate({
        where: { ...baseWhere, expenseDate: { gte: startOfMonth } },
        _sum: { totalPaid: true },
      }),
      prisma.expense.aggregate({
        where: { ...baseWhere, status: "PENDING_APPROVAL" },
        _sum: { totalPaid: true },
      }),
      prisma.expense.aggregate({
        where: { ...baseWhere, paymentStatus: "PAID" },
        _sum: { totalPaid: true },
      }),
      prisma.expense.aggregate({
        where: { ...baseWhere, paymentStatus: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } },
        _sum: { totalPaid: true },
      }),
      prisma.expense.groupBy({
        by: ["categoryId"],
        where: baseWhere,
        _sum: { totalPaid: true },
      }),
      prisma.expenseCategory.findMany(),
    ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return {
    todaysExpense: todayAgg._sum.totalPaid || 0,
    monthlyExpense: monthAgg._sum.totalPaid || 0,
    pendingApproval: pendingAgg._sum.totalPaid || 0,
    paidExpenses: paidAgg._sum.totalPaid || 0,
    unpaidExpenses: unpaidAgg._sum.totalPaid || 0,
    categoryWise: byCategory.map((c) => ({
      category: categoryMap[c.categoryId] || "Unknown",
      total: c._sum.totalPaid || 0,
    })),
  };
};

export const getReports = async ({ from, to, groupBy }) => {
  const where = {};
  if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(from);
    if (to) where.expenseDate.lte = new Date(to);
  }

  if (groupBy === "category") {
    const rows = await prisma.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: { totalPaid: true },
      _count: { id: true },
    });
    const categories = await prisma.expenseCategory.findMany();
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    return rows.map((r) => ({
      category: categoryMap[r.categoryId] || "Unknown",
      total: r._sum.totalPaid || 0,
      count: r._count.id,
    }));
  }

  return prisma.expense.findMany({
    where,
    include: { category: true, supplier: true },
    orderBy: { expenseDate: "desc" },
  });
};