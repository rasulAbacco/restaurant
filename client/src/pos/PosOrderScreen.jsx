// src/pos/PosOrderScreen.jsx
import { useState } from "react";
import TableStrip from "./components/TableStrip";
import MenuBrowser from "./components/MenuBrowser";
import OrderTicket from "./components/OrderTicket";
import { createOrder, sendToKitchen } from "./api/posApi";

export default function PosOrderScreen() {
  const [orderType, setOrderType] = useState("DINE_IN");
  const [tableId, setTableId] = useState(null);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  function addItem(menuItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          sellingPrice: Number(menuItem.sellingPrice),
          gstPercent: Number(menuItem.gstPercent || 0),
          quantity: 1,
          notes: "",
        },
      ];
    });
  }

  function increment(menuItemId) {
    setCart((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i)));
  }

  function decrement(menuItemId) {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function remove(menuItemId) {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  function setNote(menuItemId, notes) {
    setCart((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i)));
  }

  async function placeOrder() {
    setError(null);
    setPlacing(true);
    try {
      const order = await createOrder({
        orderType,
        tableId: orderType === "DINE_IN" ? tableId : undefined,
        store: "Main Store",
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          notes: i.notes || undefined,
        })),
      });

      // Fire every item straight to the kitchen on placement.
      const orderItemIds = order.items.map((i) => i.id);
      if (orderItemIds.length) {
        await sendToKitchen(order.id, orderItemIds);
      }

      setLastOrder(order);
      setCart([]);
      setTableId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-600">
              <path
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">POS · New Order</h1>
        </div>
        {lastOrder && (
          <p className="mt-1 text-sm text-emerald-600">
            Order <span className="font-mono font-semibold">{lastOrder.orderNumber}</span> sent to kitchen.
          </p>
        )}
      </header>

      {orderType === "DINE_IN" && (
        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <TableStrip selectedTableId={tableId} onSelect={setTableId} />
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
          <MenuBrowser onAddItem={addItem} />
        </div>

        <OrderTicket
          orderType={orderType}
          onChangeOrderType={setOrderType}
          tableSelected={!!tableId}
          cart={cart}
          onIncrement={increment}
          onDecrement={decrement}
          onRemove={remove}
          onNoteChange={setNote}
          onPlaceOrder={placeOrder}
          placing={placing}
          error={error}
        />
      </div>
    </div>
  );
}