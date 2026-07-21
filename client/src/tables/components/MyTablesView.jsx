// src/pos/components/MyTablesView.jsx
//
// Read-only view shown to WAITER role instead of the full Tables management
// screen. Scoped entirely server-side (GET /pos/tables/my-tables only ever
// returns tables where waiterId === the logged-in waiter), so there's no
// client-side filtering to get wrong here.
import { useEffect, useState } from "react";
import { Users, Receipt, CreditCard } from "lucide-react";
import { getMyTables } from "../api/tablesManagementApi";

const STATUS_META = {
  FREE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  OCCUPIED: {
    label: "Occupied",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  RESERVED: {
    label: "Reserved",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
};

const PAYMENT_META = {
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-600" },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    className: "bg-amber-50 text-amber-600",
  },
  UNPAID: { label: "Unpaid", className: "bg-red-50 text-red-600" },
};

export default function MyTablesView() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setTables(await getMyTables());
    } catch (err) {
      setError(err.message || "Couldn't load your tables.");
    } finally {
      setLoading(false);
    }
  }

  // Group by floor for readability — "Ground Floor: T1, T2…", "First Floor: T5, T6…"
  const groupedByFloor = tables.reduce((acc, t) => {
    const key = t.floor?.name || "Unassigned Floor";
    (acc[key] = acc[key] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[30px] font-bold text-[#1C3044]">My Tables</h1>
        <p className="text-sm text-slate-400">
          Tables assigned to you, with live order and payment status.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">
          Loading your tables…
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            No tables have been assigned to you yet.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ask your manager to assign tables from the Tables page.
          </p>
        </div>
      ) : (
        Object.entries(groupedByFloor).map(([floorName, floorTables]) => (
          <div key={floorName} className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              {floorName}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {floorTables.map((table) => {
                const status = STATUS_META[table.status] || STATUS_META.FREE;
                const payment =
                  table.order && PAYMENT_META[table.order.paymentStatus];
                return (
                  <div
                    key={table.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-base font-bold text-slate-800">
                          {table.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3.5 w-3.5" />
                          {table.capacity
                            ? `${table.capacity} seats`
                            : "Capacity not set"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {table.order ? (
                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Receipt className="h-3.5 w-3.5" />
                            {table.order.orderNumber}
                          </span>
                          <span>
                            {table.order.numberOfGuests
                              ? `${table.order.numberOfGuests} guests`
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">
                            ₹{Number(table.order.grandTotal).toFixed(2)}
                          </span>
                          {payment && (
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${payment.className}`}
                            >
                              <CreditCard className="h-3 w-3" />
                              {payment.label}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                        No active order
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
