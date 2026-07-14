// ==============================================
// server/src/profitLoss/profitLoss.utils.js
// ==============================================
// Shared helpers used across the P&L service/controller: date-range parsing,
// number formatting, and file exporters for the Reports endpoint.
//
// Export deps (only loaded lazily, only when actually used):
//   npm install exceljs pdfkit

export const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  err.expose = true;
  return err;
};

// ------------------------------------------------------------------
// Date range parsing
// ------------------------------------------------------------------
// Supports either an explicit from/to, OR a `period` shorthand matching the
// doc's "Today / Weekly / Monthly / Yearly" language.

export const PERIOD_PRESETS = ["today", "week", "month", "year"];

export const parseDateRange = ({ from, to, period }) => {
  const now = new Date();

  if (!from && !to && period) {
    if (!PERIOD_PRESETS.includes(period)) {
      throw badRequest(`period must be one of: ${PERIOD_PRESETS.join(", ")}`);
    }

    const toDate = now;
    let fromDate;

    if (period === "today") {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      fromDate = new Date(now.getFullYear(), 0, 1);
    }

    return { fromDate, toDate };
  }

  const toDate = to ? new Date(to) : now;
  const fromDate = from
    ? new Date(from)
    : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000); // default: trailing 30 days

  if (Number.isNaN(fromDate.getTime())) throw badRequest("Invalid 'from' date");
  if (Number.isNaN(toDate.getTime())) throw badRequest("Invalid 'to' date");
  if (fromDate > toDate)
    throw badRequest("'from' date must be before 'to' date");

  // include the entire 'to' day when it's a plain date (no time component)
  const toDateInclusive = new Date(toDate);
  if (!to || /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    toDateInclusive.setHours(23, 59, 59, 999);
  }

  return { fromDate, toDate: toDateInclusive };
};

// Convenience: the previous period of equal length, used for anomaly checks
// in the /alerts endpoint (e.g. "expenses up 40% vs the prior period").
export const previousPeriod = ({ fromDate, toDate }) => {
  const spanMs = toDate.getTime() - fromDate.getTime();
  const prevTo = new Date(fromDate.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - spanMs);
  return { fromDate: prevFrom, toDate: prevTo };
};

// ------------------------------------------------------------------
// Numbers
// ------------------------------------------------------------------

export const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return typeof value === "object" && typeof value.toNumber === "function"
    ? value.toNumber()
    : Number(value);
};

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const percent = (numerator, denominator) =>
  denominator ? round2((numerator / denominator) * 100) : 0;

// ------------------------------------------------------------------
// Exporters — used by GET /profit-loss/reports?format=csv|excel|pdf
// ------------------------------------------------------------------

export const rowsToCSV = (rows) => {
  if (!rows || rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  return lines.join("\n");
};

export const rowsToExcelBuffer = async (rows, sheetName = "Report") => {
  // Lazy import so the app doesn't hard-fail if exceljs isn't installed and
  // nobody has asked for an Excel export yet.
  const ExcelJS = (await import("exceljs")).default;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  if (rows.length > 0) {
    sheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 22,
    }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };
  }

  return workbook.xlsx.writeBuffer();
};

export const rowsToPDFBuffer = async (title, rows) => {
  // Lazy import — see note above.
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "landscape",
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text(title, { align: "left" });
    doc.moveDown();

    if (rows.length === 0) {
      doc.fontSize(11).text("No data for the selected filters.");
      doc.end();
      return;
    }

    const headers = Object.keys(rows[0]);
    const colWidth = (doc.page.width - 80) / headers.length;

    doc.fontSize(9).font("Helvetica-Bold");
    headers.forEach((h, i) =>
      doc.text(String(h), 40 + i * colWidth, doc.y, { width: colWidth }),
    );
    doc.moveDown(0.5);
    doc.font("Helvetica");

    rows.forEach((row) => {
      const y = doc.y;
      headers.forEach((h, i) =>
        doc.text(String(row[h] ?? ""), 40 + i * colWidth, y, {
          width: colWidth,
        }),
      );
      doc.moveDown(0.6);

      if (doc.y > doc.page.height - 60)
        doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
    });

    doc.end();
  });
};

export const sendExport = async (
  res,
  { format, filenameBase, title, rows, jsonPayload },
) => {
  if (!format || format === "json") {
    res.json({ success: true, data: jsonPayload ?? rows });
    return;
  }

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}.csv"`,
    );
    res.send(rowsToCSV(rows));
    return;
  }

  if (format === "excel") {
    const buffer = await rowsToExcelBuffer(rows, filenameBase);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}.xlsx"`,
    );
    res.send(buffer);
    return;
  }

  if (format === "pdf") {
    const buffer = await rowsToPDFBuffer(title, rows);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}.pdf"`,
    );
    res.send(buffer);
    return;
  }

  throw badRequest("format must be one of: json, csv, excel, pdf");
};
