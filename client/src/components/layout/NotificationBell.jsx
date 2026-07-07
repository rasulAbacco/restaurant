// ==============================================
// src/components/layout/NotificationBell.jsx
// ==============================================

import React, { useEffect, useRef, useState } from "react";

import {
  FiBell,
  FiShoppingCart,
  FiDollarSign,
  FiBox,
  FiCoffee,
  FiCheck,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

const NotificationBell = () => {
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Order Received",
      description: "Table 05 placed a new order.",
      time: "2 min ago",
      unread: true,
      icon: <FiShoppingCart />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      title: "Payment Received",
      description: "Invoice #INV-1023 has been paid.",
      time: "12 min ago",
      unread: true,
      icon: <FiDollarSign />,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      title: "Low Stock Alert",
      description: "Cheese stock is running low.",
      time: "35 min ago",
      unread: true,
      icon: <FiBox />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: 4,
      title: "Kitchen Order Ready",
      description: "Order #105 is ready to serve.",
      time: "1 hour ago",
      unread: false,
      icon: <FiCoffee />,
      color: "bg-purple-100 text-purple-600",
    },
  ]);

  // ==========================================
  // CLOSE OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // UNREAD COUNT
  // ==========================================

  const unreadCount = notifications.filter((item) => item.unread).length;

  // ==========================================
  // MARK AS READ
  // ==========================================

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}

      <button
        onClick={() => setOpen(!open)}
        className="relative w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center"
      >
        <FiBell className="text-xl text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>
      {/* ================= DROPDOWN ================= */}

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
          {/* Header */}

          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Notifications</h3>

              <p className="text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((item) => ({
                    ...item,
                    unread: false,
                  })),
                )
              }
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition"
            >
              <FiCheck className="inline mr-1" />
              Mark All
            </button>
          </div>

          {/* Notification List */}

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-14 text-center">
                <FiBell className="mx-auto text-5xl text-gray-300" />

                <h4 className="mt-4 text-lg font-semibold text-gray-700">
                  No Notifications
                </h4>

                <p className="mt-2 text-gray-500">You're all caught up.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    item.unread ? "bg-blue-50/40" : ""
                  }`}
                  onClick={() => markAsRead(item.id)}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>

                        {item.unread && (
                          <span className="w-3 h-3 rounded-full bg-blue-600 mt-2"></span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-500 leading-6">
                        {item.description}
                      </p>

                      <p className="mt-3 text-xs text-gray-400">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* ================= FOOTER ================= */}

          <div className="border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2">
              <button
                onClick={() => {
                  setOpen(false);
                  // Future:
                  // navigate("/notifications");
                }}
                className="flex items-center justify-center gap-2 py-4 hover:bg-gray-100 transition font-medium text-gray-700 border-r border-gray-200"
              >
                <FiEye />
                View All
              </button>

              <button
                onClick={clearAll}
                className="flex items-center justify-center gap-2 py-4 hover:bg-red-50 transition font-medium text-red-600"
              >
                <FiTrash2 />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
