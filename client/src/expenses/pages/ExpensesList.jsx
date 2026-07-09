// ==============================================
// src/expenses/pages/ExpensesList.jsx
// ==============================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import expenseService from "../services/expenseService";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseTable from "../components/ExpenseTable";
import ImportModal from "../components/ImportModal";
import { FiPlus, FiUpload, FiDownload } from "react-icons/fi";

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadExpenses, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, paymentStatus, category]);

  const loadCategories = async () => {
    try {
      const data = await expenseService.getCategories();
      setCategories(data);
    } catch (err) {
      // categories failing to load shouldn't block the page
    }
  };

  // Shared by the list fetch AND the "Export Filtered" button, so both
  // always agree on exactly what's currently filtered.
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (paymentStatus) params.append("paymentStatus", paymentStatus);
    if (category) params.append("category", category);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await expenseService.getExpenses(buildQuery());
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Remove "${title}"? This can't be undone.`)) return;

    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = async (scope) => {
    try {
      setExporting(scope);
      await expenseService.exportExpenses(scope === "filtered" ? buildQuery() : "");
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
        <button
          onClick={() => handleExport("filtered")}
          disabled={exporting === "filtered"}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 font-medium px-4 py-3 rounded-xl hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
        >
          <FiDownload /> {exporting === "filtered" ? "Exporting..." : "Export Filtered"}
        </button>

        <button
          onClick={() => handleExport("all")}
          disabled={exporting === "all"}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 font-medium px-4 py-3 rounded-xl hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
        >
          <FiDownload /> {exporting === "all" ? "Exporting..." : "Export All"}
        </button>

        <button
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-600 font-medium px-4 py-3 rounded-xl hover:border-blue-200 hover:text-blue-600"
        >
          <FiUpload /> Import
        </button>

        <Link
          to="/expenses/add"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <FiPlus /> Add Expense
        </Link>
      </div>

      <ExpenseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onRefresh={loadExpenses}
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 px-5 py-4 text-sm">
          {error}
        </div>
      )}

      <ExpenseTable expenses={expenses} loading={loading} onDelete={handleDelete} />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadExpenses}
      />
    </div>
  );
};

export default ExpensesList;