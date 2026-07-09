// ==============================================
// src/expenses/components/ImportModal.jsx
// ==============================================

import { useState } from "react";
import expenseService from "../services/expenseService";
import { FiX, FiUpload, FiDownload, FiCheckCircle, FiAlertTriangle, FiFileText } from "react-icons/fi";

const ImportModal = ({ open, onClose, onImported }) => {
  const [file, setFile] = useState(null);
  const [checking, setChecking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState(null); // { validRows, errorRows }
  const [error, setError] = useState("");
  const [doneCount, setDoneCount] = useState(null);

  if (!open) return null;

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setDoneCount(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError("");

    try {
      setChecking(true);
      const data = await expenseService.validateImportFile(selected);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setError("");
    try {
      setDownloadingTemplate(true);
      await expenseService.downloadImportTemplate();
    } catch (err) {
      setError(err.message || "Could not download the template. Please try again.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleConfirm = async () => {
    if (!result?.validRows?.length) return;
    try {
      setImporting(true);
      const res = await expenseService.confirmImportRows(result.validRows);
      setDoneCount(res.created?.length || 0);
      onImported?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">Import Expenses from Excel</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {doneCount !== null ? (
            <div className="text-center py-10">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">
                {doneCount} expense{doneCount === 1 ? "" : "s"} imported
              </h3>
              <p className="mt-1 text-gray-500 text-sm">They're now in your expenses list.</p>
              <button
                onClick={handleClose}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: template + upload */}
              <div className="rounded-2xl border border-dashed border-gray-300 p-5">
                <p className="text-sm text-gray-600 mb-3">
                  New here? Start with the template — it has an <strong>Instructions</strong> sheet
                  explaining exactly what goes in each column, plus an example row.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-blue-300"
                >
                  <FiDownload /> {downloadingTemplate ? "Downloading…" : "Download template"}
                </button>

                <div className="mt-4">
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-8 hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                    <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
                    {file ? (
                      <>
                        <FiFileText className="text-2xl text-blue-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <FiUpload className="text-2xl text-gray-400" />
                        <span className="text-sm text-gray-500">Tap to choose your filled-in .xlsx file</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {checking && <p className="text-center text-sm text-gray-400">Checking your file…</p>}

              {error && <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}

              {/* Step 2: preview */}
              {result && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{result.validRows.length}</p>
                      <p className="text-xs text-green-700">Ready to import</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{result.errorRows.length}</p>
                      <p className="text-xs text-red-600">Rows with problems</p>
                    </div>
                  </div>

                  {result.errorRows.length > 0 && (
                    <div className="rounded-xl border border-red-100 overflow-hidden">
                      <div className="bg-red-50 px-4 py-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                        <FiAlertTriangle /> Fix these rows in your file and re-upload
                      </div>
                      <div className="max-h-56 overflow-y-auto divide-y divide-red-50">
                        {result.errorRows.map((row) => (
                          <div key={row.rowNumber} className="px-4 py-2.5 text-sm">
                            <span className="font-semibold text-gray-700">Row {row.rowNumber}</span>
                            <ul className="list-disc list-inside text-red-600 mt-0.5">
                              {row.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.validRows.length > 0 && (
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                        Preview — {result.validRows.length} row{result.validRows.length === 1 ? "" : "s"} will be created
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-400 uppercase">
                              <th className="px-4 py-2">Title</th>
                              <th className="px-4 py-2">Category</th>
                              <th className="px-4 py-2">Store</th>
                              <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.validRows.map((row) => (
                              <tr key={row.rowNumber} className="border-t border-gray-50">
                                <td className="px-4 py-2">{row.title}</td>
                                <td className="px-4 py-2">{row.categoryName}</td>
                                <td className="px-4 py-2">{row.store}</td>
                                <td className="px-4 py-2 text-right">
                                  ₹{Number(row.totalPaid).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {doneCount === null && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <button onClick={handleClose} className="rounded-lg border px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!result?.validRows?.length || importing}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {importing
                ? "Importing..."
                : `Import ${result?.validRows?.length || 0} Expense${result?.validRows?.length === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;