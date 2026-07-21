// src/pos/components/AssignWaiterModal.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, UserCog } from "lucide-react";

// Handles all three assignment scopes the owner can pick from:
//  - "selected"  -> the table ids the user checked on the grid (selectedTableIds)
//  - "floor"     -> every table on the currently open floor tab
//  - "all"       -> every table in the restaurant, across every floor
//
// `scope` is fixed by whichever button opened the modal (see Tables.jsx),
// so this component just needs a waiter picker + confirm.
export default function AssignWaiterModal({
  open,
  onClose,
  scope, // "selected" | "floor" | "all"
  selectedCount = 0,
  floorName,
  waiters,
  waitersLoading,
  onConfirm, // (waiterId) => Promise
}) {
  const [waiterId, setWaiterId] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setWaiterId("");
      setError(null);
    }
  }, [open, scope]);

  if (!open) return null;

  const scopeLabel =
    scope === "all"
      ? "all tables across every floor"
      : scope === "floor"
        ? `every table on "${floorName}"`
        : `${selectedCount} selected table${selectedCount === 1 ? "" : "s"}`;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!waiterId) {
      setError("Please select a waiter.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onConfirm(waiterId);
      onClose();
    } catch (err) {
      setError(err.message || "Couldn't assign tables.");
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1C3044]">
              <UserCog className="h-5 w-5" />
              Assign Waiter
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 px-5 py-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <p className="text-sm text-slate-500">
              This will assign{" "}
              <span className="font-semibold text-slate-700">{scopeLabel}</span>{" "}
              to the waiter you choose below. Any previous assignment on those
              tables will be replaced.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Select waiter *
              </label>
              {waitersLoading ? (
                <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400">
                  Loading waiters…
                </div>
              ) : waiters.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-400">
                  No waiter logins found. Create one from Employees → select
                  employee → Account tab.
                </div>
              ) : (
                <select
                  value={waiterId}
                  onChange={(e) => setWaiterId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                >
                  <option value="" disabled>
                    Choose a waiter
                  </option>
                  {waiters.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.employeeCode}) — {w.assignedTableCount}{" "}
                      table
                      {w.assignedTableCount === 1 ? "" : "s"} currently
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || waitersLoading || waiters.length === 0}
              className="rounded-lg bg-[#1C3044] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#27435B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
