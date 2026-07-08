// src/pos/components/KotCard.jsx
import { useEffect, useState } from "react";

const NEXT_STATUS = {
  NEW: { next: "ACCEPTED", label: "Accept" },
  ACCEPTED: { next: "PREPARING", label: "Start Preparing" },
  PREPARING: { next: "READY", label: "Mark Ready" },
  READY: { next: "SERVED", label: "Mark Served" },
};

const STATUS_BADGE = {
  NEW: "bg-blue-50 text-blue-600 border-blue-200",
  ACCEPTED: "bg-amber-50 text-amber-600 border-amber-200",
  PREPARING: "bg-indigo-50 text-indigo-600 border-indigo-200",
  READY: "bg-emerald-50 text-emerald-600 border-emerald-200",
  SERVED: "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_LABEL = {
  VIP: "VIP",
  ONLINE_DELIVERY: "Online",
  EXPRESS: "Express",
  SENIOR_CITIZEN: "Senior",
  SPECIAL_REQUEST: "Special",
};

function useElapsedMinutes(since) {
  const [minutes, setMinutes] = useState(() => (Date.now() - new Date(since).getTime()) / 60000);

  useEffect(() => {
    const id = setInterval(() => {
      setMinutes((Date.now() - new Date(since).getTime()) / 60000);
    }, 1000);
    return () => clearInterval(id);
  }, [since]);

  return minutes;
}

export default function KotCard({ kot, onAdvance, onCancel, updating }) {
  const elapsedMinutes = useElapsedMinutes(kot.createdAt);
  const elapsedSeconds = Math.floor(elapsedMinutes * 60);
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const ss = String(elapsedSeconds % 60).padStart(2, "0");

  const isOverdue = kot.targetPrepMinutes && elapsedMinutes > kot.targetPrepMinutes;
  const timerColor = isOverdue ? "text-red-500" : elapsedMinutes > 8 ? "text-amber-500" : "text-blue-600";

  const action = NEXT_STATUS[kot.status];

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        isOverdue ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{kot.kotNumber}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {kot.order?.orderNumber}
            {kot.order?.table?.name ? ` · ${kot.order.table.name}` : ""}
            {kot.order?.orderType ? ` · ${kot.order.orderType.replace("_", " ")}` : ""}
          </p>
        </div>
        <span className={`rounded-lg bg-blue-50 px-2 py-1 font-mono text-lg font-bold tabular-nums ${timerColor}`}>
          {mm}:{ss}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[kot.status] || ""}`}>
          {kot.status}
        </span>
        {kot.priority !== "NORMAL" && (
          <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
            {PRIORITY_LABEL[kot.priority] || kot.priority}
          </span>
        )}
        {isOverdue && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
            Delayed
          </span>
        )}
      </div>

      <ul className="mt-3 flex-1 space-y-2 border-t border-slate-100 pt-3">
        {kot.items.map((item) => (
          <li key={item.id} className="text-sm">
            <div className="flex justify-between text-slate-700">
              <span className="font-medium">
                {item.quantity} × {item.orderItem.menuItem.name}
              </span>
            </div>
            {item.orderItem.notes && (
              <p className="mt-0.5 text-xs italic text-amber-600">"{item.orderItem.notes}"</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        {action && (
          <button
            onClick={() => onAdvance(kot.id, action.next)}
            disabled={updating}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {updating ? "Updating…" : action.label}
          </button>
        )}
        {kot.status !== "READY" && kot.status !== "SERVED" && (
          <button
            onClick={() => onCancel(kot.id)}
            disabled={updating}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-red-300 hover:text-red-500"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}