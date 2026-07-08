// src/pos/components/OrderTicket.jsx
export default function OrderTicket({
  orderType,
  onChangeOrderType,
  tableSelected,
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onNoteChange,
  onPlaceOrder,
  placing,
  error,
}) {
  const subtotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  const gst = cart.reduce((sum, i) => sum + (i.sellingPrice * i.quantity * (i.gstPercent || 0)) / 100, 0);
  const total = subtotal + gst;

  const canPlace = cart.length > 0 && (orderType !== "DINE_IN" || tableSelected) && !placing;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* perforated top edge — the "torn ticket" signature */}
      <div className="relative border-b border-dashed border-slate-300 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Order Ticket
          </h2>
          <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-600">
            NEW
          </span>
        </div>

        <div className="mt-3 flex gap-1.5">
          {["DINE_IN", "TAKEAWAY"].map((type) => (
            <button
              key={type}
              onClick={() => onChangeOrderType(type)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                orderType === type ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-400">
            Tap a dish to add it to this ticket.
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.map((item) => (
              <li key={item.menuItemId} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800">{item.name}</span>
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    ₹{(item.sellingPrice * item.quantity).toFixed(0)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      onClick={() => onDecrement(item.menuItemId)}
                      className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="px-2 font-mono text-sm text-slate-700">{item.quantity}</span>
                    <button
                      onClick={() => onIncrement(item.menuItemId)}
                      className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(item.menuItemId)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={item.notes}
                  onChange={(e) => onNoteChange(item.menuItemId, e.target.value)}
                  placeholder="Add a note (e.g. less spicy)"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-blue-400 focus:outline-none"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-dashed border-slate-300 px-4 py-3">
        <div className="space-y-1 font-mono text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={onPlaceOrder}
          disabled={!canPlace}
          className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {placing ? "Placing order…" : "Send to Kitchen"}
        </button>
      </div>
    </div>
  );
}