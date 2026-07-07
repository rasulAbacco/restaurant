// ==============================================
// src/kiosk/KioskCheckout.jsx
// ==============================================

import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiShoppingBag,
  FiUser,
  FiPhone,
  FiFileText,
} from "react-icons/fi";

const TABLES = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

const KioskCheckout = ({ open = false, cart = [], onClose, onContinue }) => {
  // ==========================================
  // STATES
  // ==========================================

  const [orderType, setOrderType] = useState("DINE_IN");

  const [selectedTable, setSelectedTable] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [phone, setPhone] = useState("");

  const [notes, setNotes] = useState("");

  // ==========================================
  // RESET
  // ==========================================

  useEffect(() => {
    if (open) {
      setOrderType("DINE_IN");

      setSelectedTable("");

      setCustomerName("");

      setPhone("");

      setNotes("");
    }
  }, [open]);

  // ==========================================
  // TOTALS
  // ==========================================

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const gst = Math.round(subtotal * 0.05);

  const grandTotal = subtotal + gst;

  // ==========================================
  // CONTINUE
  // ==========================================

  const handleContinue = () => {
    if (orderType === "DINE_IN" && !selectedTable) {
      alert("Please select a table.");
      return;
    }

    onContinue?.({
      orderType,
      table: selectedTable,
      customerName,
      phone,
      notes,
      subtotal,
      gst,
      grandTotal,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="h-24 border-b border-gray-200 px-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <FiArrowLeft size={26} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>

              <p className="text-gray-500 mt-1">
                Confirm your order before payment
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-500">Grand Total</p>

            <h2 className="text-4xl font-bold text-orange-600">
              ₹{grandTotal}
            </h2>
          </div>
        </div>

        {/* ======================================
            BODY
        ====================================== */}

        <div className="flex-1 grid grid-cols-3 overflow-hidden">
          {/* LEFT */}

          <div className="col-span-2 overflow-y-auto p-10">
            <h2 className="text-2xl font-bold mb-8">Select Order Type</h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Dine In */}

              <button
                onClick={() => setOrderType("DINE_IN")}
                className={`rounded-3xl border-2 p-8 transition ${
                  orderType === "DINE_IN"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <FiHome size={52} className="mx-auto text-orange-500" />

                <h3 className="text-2xl font-bold mt-5">Dine In</h3>

                <p className="text-gray-500 mt-2">Eat inside restaurant</p>
              </button>

              {/* Take Away */}

              <button
                onClick={() => setOrderType("TAKE_AWAY")}
                className={`rounded-3xl border-2 p-8 transition ${
                  orderType === "TAKE_AWAY"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <FiShoppingBag size={52} className="mx-auto text-orange-500" />

                <h3 className="text-2xl font-bold mt-5">Take Away</h3>

                <p className="text-gray-500 mt-2">Pack your food</p>
              </button>
            </div>
            {/* ======================================
                TABLE SELECTION
            ====================================== */}

            {orderType === "DINE_IN" && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Select Your Table</h2>

                <div className="grid grid-cols-4 gap-5">
                  {TABLES.map((table) => (
                    <button
                      key={table}
                      onClick={() => setSelectedTable(table)}
                      className={`h-24 rounded-2xl border-2 text-2xl font-bold transition-all ${
                        selectedTable === table
                          ? "bg-orange-500 text-white border-orange-500 scale-105"
                          : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                      }`}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================
                CUSTOMER DETAILS
            ====================================== */}

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Customer Details (Optional)
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Name */}

                <div>
                  <label className="block mb-3 text-lg font-semibold">
                    Customer Name
                  </label>

                  <div className="relative">
                    <FiUser
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={22}
                    />

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full h-16 rounded-2xl border border-gray-300 pl-14 pr-5 text-lg focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}

                <div>
                  <label className="block mb-3 text-lg font-semibold">
                    Mobile Number
                  </label>

                  <div className="relative">
                    <FiPhone
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={22}
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full h-16 rounded-2xl border border-gray-300 pl-14 pr-5 text-lg focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================
                SPECIAL INSTRUCTIONS
            ====================================== */}

            <div className="mt-10">
              <label className="block mb-3 text-lg font-semibold">
                Special Instructions
              </label>

              <div className="relative">
                <FiFileText
                  className="absolute left-5 top-6 text-gray-400"
                  size={22}
                />

                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Example: Less spicy, No onion, Extra tissue..."
                  className="w-full rounded-2xl border border-gray-300 pl-14 pr-5 pt-5 text-lg resize-none focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          {/* ======================================
              ORDER SUMMARY
          ====================================== */}

          <div className="border-l border-gray-200 bg-gray-50 flex flex-col">
            {/* Header */}

            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Order Summary
              </h2>

              <p className="text-gray-500 mt-2">Review your order</p>
            </div>

            {/* Items */}

            <div className="flex-1 overflow-y-auto p-8 space-y-5">
              {cart.length === 0 ? (
                <div className="text-center mt-20">
                  <h3 className="text-xl font-semibold text-gray-500">
                    No items in cart
                  </h3>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>

                        <p className="text-gray-500 mt-2">
                          Qty : {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-orange-600 text-xl">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill */}

            <div className="border-t border-gray-200 bg-white p-8">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>

                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">GST (5%)</span>

                  <span className="font-semibold">
                    ₹{gst.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t pt-5 flex justify-between">
                  <span className="text-2xl font-bold">Grand Total</span>

                  <span className="text-3xl font-bold text-orange-600">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Continue */}

              <button
                onClick={handleContinue}
                className="mt-8 w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold flex items-center justify-center gap-3 transition-all duration-300"
              >
                Continue To Payment
                <FiArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskCheckout;
