// ==============================================
// src/dashboard/components/RecentOrders.jsx
// ==============================================

import React from "react";
import { FiEye, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const orders = [
  {
    id: "#ORD-1001",
    customer: "Rahul Sharma",
    table: "T-05",
    items: 4,
    amount: 1240,
    status: "Preparing",
    payment: "Paid",
    time: "2 min ago",
  },
  {
    id: "#ORD-1002",
    customer: "Priya Patel",
    table: "T-02",
    items: 2,
    amount: 680,
    status: "Ready",
    payment: "Paid",
    time: "5 min ago",
  },
  {
    id: "#ORD-1003",
    customer: "Amit Kumar",
    table: "Take Away",
    items: 6,
    amount: 1980,
    status: "Pending",
    payment: "Pending",
    time: "9 min ago",
  },
  {
    id: "#ORD-1004",
    customer: "Sneha Joshi",
    table: "T-08",
    items: 3,
    amount: 940,
    status: "Completed",
    payment: "Paid",
    time: "14 min ago",
  },
  {
    id: "#ORD-1005",
    customer: "Walk In Customer",
    table: "T-11",
    items: 5,
    amount: 1560,
    status: "Preparing",
    payment: "Paid",
    time: "20 min ago",
  },
];

const statusStyle = {
  Pending: "bg-yellow-100 text-yellow-700",
  Preparing: "bg-blue-100 text-blue-700",
  Ready: "bg-green-100 text-green-700",
  Completed: "bg-gray-100 text-gray-700",
};

const paymentStyle = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-red-100 text-red-700",
};

const RecentOrders = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>

          <p className="text-gray-500 mt-1">Latest restaurant orders</p>
        </div>

        <button className="text-blue-600 font-semibold hover:text-blue-700 transition">
          View All
        </button>
      </div>

      {/* Desktop Table */}

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Order
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Customer
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Table
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Items
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Amount
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Status
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Payment
              </th>

              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                Time
              </th>

              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-5 font-semibold text-blue-600">
                  {order.id}
                </td>

                <td className="px-6 py-5">{order.customer}</td>

                <td className="px-6 py-5">{order.table}</td>

                <td className="px-6 py-5">{order.items}</td>

                <td className="px-6 py-5 font-semibold">
                  ₹{order.amount.toLocaleString("en-IN")}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStyle[order.payment]}`}
                  >
                    {order.payment}
                  </span>
                </td>

                <td className="px-6 py-5 text-gray-500">{order.time}</td>

                <td className="px-6 py-5 text-center">
                  <button className="w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center mx-auto transition">
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="lg:hidden p-4 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-blue-600">{order.id}</h3>

                <p className="text-gray-500 mt-1">{order.customer}</p>
              </div>

              <button className="text-blue-600">
                <FiEye size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Table</span>
                <p>{order.table}</p>
              </div>

              <div>
                <span className="text-gray-500">Items</span>
                <p>{order.items}</p>
              </div>

              <div>
                <span className="text-gray-500">Amount</span>
                <p>₹{order.amount}</p>
              </div>

              <div>
                <span className="text-gray-500">Time</span>
                <p>{order.time}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}
              >
                {order.status}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStyle[order.payment]}`}
              >
                {order.payment}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <FiClock />
          Updated just now
        </div>

        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <FiCheckCircle />
          Live Order Tracking
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
