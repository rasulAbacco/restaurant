// src/billing/Billings.jsx
//
// Dedicated Billing & Payment page — replaces BillingPaymentModal. Three
// columns: active orders (left) | bill + payment (middle) | invoice, which
// appears in its own column on the right once payment completes, instead
// of replacing the billing panel or taking over the whole page.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InvoiceView from "./InvoiceView";
import { getOrders, getBillingSummary, completeBilling, sendToKitchen } from "../pos/api/posApi";

const PAYMENT_METHODS = [
  { key: "CASH", label: "Cash" },
  { key: "CARD", label: "Card" },
  { key: "UPI", label: "UPI" },
];

const ACTIVE_STATUSES = ["NEW", "ACCEPTED", "PREPARING", "READY", "SERVED", "OUT_FOR_DELIVERY", "ON_HOLD"];

function makeSplitLineId() {
  return `split_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function orderBalanceDue(order) {
  const paid = (order.payments || [])
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return Math.max(Number(order.grandTotal) - paid, 0);
}

export default function Billings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId || null);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [mode, setMode] = useState("CASH"); // CASH | CARD | UPI | SPLIT
  const [splitLines, setSplitLines] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState(null);

  // Discount keyed in at the billing counter — applied on top of whatever
  // discount (if any) is already on the order. Not persisted until
  // "Complete Payment" is clicked; everything below is just a live preview.
  const [discountType, setDiscountType] = useState(null); // null | "PERCENTAGE" | "FIXED_AMOUNT"
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");

  const [result, setResult] = useState(null); // { order, invoice, payments } once paid
  // Only takeaway orders get fired to the kitchen from here (dine-in orders
  // were already sent when they were placed) — tracked so the success
  // message can say the right thing, and so a failed kitchen call after a
  // successful payment surfaces without blocking the invoice.
  const [sentToKitchen, setSentToKitchen] = useState(false);
  const [kitchenError, setKitchenError] = useState(null);

  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    setOrdersError(null);
    getOrders({ limit: 100 })
      .then((data) => {
        const list = (data?.data || []).filter((o) => ACTIVE_STATUSES.includes(o.status));
        setOrders(list);
      })
      .catch((err) => setOrdersError(err.message))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadSummary = useCallback((orderId) => {
    if (!orderId) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setResult(null);
    setPayError(null);
    setSentToKitchen(false);
    setKitchenError(null);
    setMode("CASH");
    setDiscountType(null);
    setDiscountValue("");
    setDiscountReason("");
    getBillingSummary(orderId)
      .then((data) => {
        if (!data || !Array.isArray(data.items)) {
          throw new Error("Billing summary came back in an unexpected shape.");
        }
        setSummary(data);
        setSplitLines([
          { id: makeSplitLineId(), method: "CASH", amount: data.balanceDue || data.grandTotal },
        ]);
      })
      .catch((err) => setSummaryError(err.message))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    if (selectedOrderId) loadSummary(selectedOrderId);
  }, [selectedOrderId, loadSummary]);

  function selectOrder(orderId) {
    setSelectedOrderId(orderId);
    setSearchParams(orderId ? { orderId } : {}, { replace: true });
  }

  function updateSplitLine(id, patch) {
    setSplitLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addSplitLine() {
    setSplitLines((prev) => [...prev, { id: makeSplitLineId(), method: "CASH", amount: "" }]);
  }

  function removeSplitLine(id) {
    setSplitLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  // Live preview of the discount being keyed in — not persisted until
  // Complete Payment is clicked. Percentage is computed off the subtotal
  // (same base the backend's own computeDiscountAmount uses), so the
  // preview matches exactly what gets recorded server-side.
  const pendingDiscountAmount = useMemo(() => {
    if (!summary || !discountType) return 0;
    const raw = Number(discountValue);
    if (!raw || raw <= 0) return 0;

    const amount = discountType === "PERCENTAGE" ? (summary.subtotal * Math.min(raw, 100)) / 100 : raw;

    // Never let a discount wipe out the balance entirely — the backend
    // requires at least one payment line with a positive amount, so at
    // least ₹0.01 always has to remain payable.
    const cap = Math.max(summary.balanceDue - 0.01, 0);
    return Math.min(Math.max(amount, 0), cap);
  }, [summary, discountType, discountValue]);

  const previewGrandTotal = summary ? Math.max(summary.grandTotal - pendingDiscountAmount, 0) : 0;
  const previewBalanceDue = summary ? Math.max(summary.balanceDue - pendingDiscountAmount, 0) : 0;

  const splitTotal = splitLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const splitMismatch = summary ? Math.abs(splitTotal - previewBalanceDue) > 0.01 : true;

  async function handleCompletePayment() {
    if (!summary) return;
    setPayError(null);
    setProcessing(true);

    const payments =
      mode === "SPLIT"
        ? splitLines
            .filter((l) => Number(l.amount) > 0)
            .map((l) => ({ method: l.method, amount: Number(l.amount) }))
        : [{ method: mode, amount: previewBalanceDue }];

    // Only sent if a discount was actually keyed in — the backend skips
    // discount application entirely when this is omitted.
    const discount =
      pendingDiscountAmount > 0
        ? { type: discountType, amount: pendingDiscountAmount, reason: discountReason || undefined }
        : undefined;

    // Capture this before the order drops off the active list on reload.
    const isTakeaway = selectedOrder?.orderType === "TAKEAWAY";

    try {
      const data = await completeBilling(selectedOrderId, { payments, discount });

      // Takeaway → Billing → Payment Completed → Send to Kitchen → Invoice.
      // Dine-in orders were already fired to the kitchen at placement, so
      // only takeaway needs this step, and only now that payment cleared.
      if (isTakeaway) {
        // Careful: data.order is a lean object (just enough to refresh the
        // active-orders list) — it does NOT reliably carry the item array.
        // The full item records with real ids live on data.invoice.order,
        // the same place InvoiceView reads them from below.
        const orderItemIds = (data.invoice?.order?.items || data.order?.items || summary?.items || []).map(
          (i) => i.id
        );
        if (orderItemIds.length) {
          try {
            await sendToKitchen(selectedOrderId, orderItemIds);
            setSentToKitchen(true);
          } catch (kitchenErr) {
            // Payment already succeeded — don't lose that. Surface the
            // kitchen-send failure separately instead of blocking the invoice.
            setKitchenError(kitchenErr.message);
          }
        } else {
          // No items found anywhere — don't silently claim success.
          setKitchenError("Could not find the order's items to send to the kitchen.");
        }
      }

      setResult(data);
      loadOrders(); // the just-billed order drops off the active list
    } catch (err) {
      setPayError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function handleDone() {
    setResult(null);
    setSummary(null);
    setSentToKitchen(false);
    setKitchenError(null);
    setDiscountType(null);
    setDiscountValue("");
    setDiscountReason("");
    selectOrder(null);
  }

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 overflow-hidden bg-slate-50 p-4">
      {/* ============ Active Orders (left) ============ */}
      <div className="flex w-72 min-h-[500px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#1C3044]">Active Orders</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {ordersLoading ? (
            <p className="p-4 text-sm text-slate-400">Loading orders…</p>
          ) : ordersError ? (
            <p className="p-4 text-sm text-red-600">{ordersError}</p>
          ) : orders.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No orders awaiting billing.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((order) => {
                const due = orderBalanceDue(order);
                return (
                  <li key={order.id}>
                    <button
                      onClick={() => selectOrder(order.id)}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-colors ${
                        selectedOrderId === order.id ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {order.orderNumber}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {order.table?.name || order.orderType?.replace("_", " ")}
                      </span>
                      <span className="flex w-full items-center justify-between text-xs text-slate-400">
                        <span>{order.status}</span>
                        <span className="font-mono font-semibold text-slate-600">₹{due.toFixed(2)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ============ Billing panel (middle) ============ */}
      <div className="flex flex-1 min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!selectedOrderId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Select an order from the list to view its bill.
          </div>
        ) : summaryLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading bill…</div>
        ) : summaryError && !summary ? (
          <div className="p-5 text-sm text-red-600">{summaryError}</div>
        ) : summary ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-[#1C3044]">Billing &amp; Payment</h2>
              <button
                onClick={() => selectOrder(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable content — everything except the header and footer button */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Table</p>
                  <p className="font-semibold text-slate-800">{summary.table?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-800">{summary.customer?.name || "Walk-in"}</p>
                </div>
              </div>

              <ul className="mb-4 space-y-2">
                {summary.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between border-b border-slate-100 pb-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.name} <span className="text-slate-400">× {item.quantity}</span>
                      </p>
                      {item.addOns.map((a, idx) => (
                        <p key={idx} className="text-xs text-slate-400">
                          + {a.name} × {a.quantity}
                        </p>
                      ))}
                    </div>
                    <span className="font-mono font-semibold text-slate-800">
                      ₹{(item.totalPrice + item.addOns.reduce((s, a) => s + a.totalPrice, 0)).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              {!result && (
                <div className="mb-4 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Discount</p>
                    {discountType && (
                      <button
                        onClick={() => {
                          setDiscountType(null);
                          setDiscountValue("");
                          setDiscountReason("");
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setDiscountType(discountType === "PERCENTAGE" ? null : "PERCENTAGE")}
                      className={`flex-1 rounded-lg border py-1.5 text-sm font-semibold transition-colors ${
                        discountType === "PERCENTAGE"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      onClick={() => setDiscountType(discountType === "FIXED_AMOUNT" ? null : "FIXED_AMOUNT")}
                      className={`flex-1 rounded-lg border py-1.5 text-sm font-semibold transition-colors ${
                        discountType === "FIXED_AMOUNT"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Amount
                    </button>
                  </div>
                  {discountType && (
                    <div className="mt-2 space-y-2">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          {discountType === "PERCENTAGE" ? "%" : "₹"}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          max={discountType === "PERCENTAGE" ? 100 : undefined}
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 50"}
                          className="w-full rounded-lg border border-slate-200 py-1.5 pl-7 pr-3 text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                      <input
                        type="text"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                      {pendingDiscountAmount > 0 && (
                        <p className="text-xs font-medium text-emerald-600">
                          −₹{pendingDiscountAmount.toFixed(2)} off this bill
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1 border-t border-dashed border-slate-300 pt-3 font-mono text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>₹{summary.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>₹{summary.sgst.toFixed(2)}</span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount already applied</span>
                    <span>−₹{summary.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {pendingDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>New discount</span>
                    <span>−₹{pendingDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{(result ? summary.grandTotal : previewGrandTotal).toFixed(2)}</span>
                </div>
                {summary.totalPaid > 0 && (
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Already paid</span>
                    <span>₹{summary.totalPaid.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {!result && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Payment Method
                  </p>
                  <div className="flex gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setMode(m.key)}
                        className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${
                          mode === m.key
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                    {/* <button
                      onClick={() => setMode("SPLIT")}
                      className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${
                        mode === "SPLIT"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Split
                    </button> */}
                  </div>

                  {mode === "SPLIT" && (
                    <div className="mt-3 space-y-2">
                      {splitLines.map((line) => (
                        <div key={line.id} className="flex items-center gap-2">
                          <select
                            value={line.method}
                            onChange={(e) => updateSplitLine(line.id, { method: e.target.value })}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m.key} value={m.key}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.amount}
                            onChange={(e) => updateSplitLine(line.id, { amount: e.target.value })}
                            placeholder="Amount"
                            className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                          />
                          <button
                            onClick={() => removeSplitLine(line.id)}
                            disabled={splitLines.length === 1}
                            className="rounded-lg px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-30"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addSplitLine}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        + Add another payment
                      </button>
                      <p className={`text-xs font-medium ${splitMismatch ? "text-red-500" : "text-emerald-600"}`}>
                        Split total: ₹{splitTotal.toFixed(2)} of ₹{previewBalanceDue.toFixed(2)} due
                      </p>
                    </div>
                  )}
                </div>
              )}

              {result && (
                <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {sentToKitchen
                    ? "Payment received — order sent to kitchen. Invoice generated on the right."
                    : "Payment received — invoice generated on the right."}
                </div>
              )}

              {kitchenError && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  Payment succeeded, but sending the order to the kitchen failed: {kitchenError}
                </p>
              )}

              {payError && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {payError}
                </p>
              )}
            </div>

            {/* Sticky footer — always visible, never scrolls away */}
            {!result && (
              <div className="shrink-0 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={handleCompletePayment}
                  disabled={processing || (mode === "SPLIT" && splitMismatch)}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {processing ? "Processing payment…" : `Complete Payment · ₹${previewBalanceDue.toFixed(2)}`}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ============ Invoice (right) — only appears once paid ============ */}
      {selectedOrderId && (summary || result) && (
        <div className="flex flex-1 min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {result ? (
            <InvoiceView invoice={result.invoice} summary={summary} payments={result.payments} onDone={handleDone} />
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-400">
              Invoice will appear here once payment is completed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}