// src/pos/components/TableStrip.jsx
import { useEffect, useState } from "react";
import { getTables } from "../api/posApi";

const STATUS_STYLE = {
  FREE: "border-slate-200 bg-white text-slate-700 hover:border-blue-400",
  OCCUPIED: "border-red-200 bg-red-50 text-red-600 cursor-not-allowed opacity-60",
  RESERVED: "border-amber-200 bg-amber-50 text-amber-600 cursor-not-allowed opacity-60",
};

export default function TableStrip({ selectedTableId, onSelect }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTables()
      .then(setTables)
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading tables…</div>;
  }

  if (tables.length === 0) {
    return <div className="text-sm text-slate-400">No tables set up yet.</div>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tables.map((t) => {
        const isSelected = t.id === selectedTableId;
        const isFree = t.status === "FREE";
        return (
          <button
            key={t.id}
            disabled={!isFree && !isSelected}
            onClick={() => onSelect(t.id)}
            className={`shrink-0 rounded-lg border px-3 py-2 font-mono text-sm font-medium transition-colors ${
              isSelected ? "border-blue-600 bg-blue-600 text-white" : STATUS_STYLE[t.status] || STATUS_STYLE.FREE
            }`}
          >
            {t.name}
            {t.capacity ? <span className="ml-1 text-xs opacity-70">· {t.capacity}p</span> : null}
          </button>
        );
      })}
    </div>
  );
}