// ==============================================
// src/dashboard/components/RecentActivities.jsx
// ==============================================

import React from "react";
import {
  FiShoppingCart,
  FiDollarSign,
  FiUserPlus,
  FiBox,
  FiCoffee,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const activities = [
  {
    id: 1,
    title: "New Order Received",
    description: "Order #ORD-1056 received from Table 08.",
    time: "2 min ago",
    icon: <FiShoppingCart />,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    id: 2,
    title: "Payment Received",
    description: "₹1,240 received via UPI.",
    time: "6 min ago",
    icon: <FiDollarSign />,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    id: 3,
    title: "New Customer Added",
    description: "Rahul Sharma registered successfully.",
    time: "12 min ago",
    icon: <FiUserPlus />,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    id: 4,
    title: "Low Stock Alert",
    description: "Mozzarella Cheese stock is below minimum level.",
    time: "18 min ago",
    icon: <FiBox />,
    bg: "bg-red-100",
    color: "text-red-600",
  },
  {
    id: 5,
    title: "Kitchen Order Ready",
    description: "Order #ORD-1050 is ready to serve.",
    time: "24 min ago",
    icon: <FiCoffee />,
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    id: 6,
    title: "Order Completed",
    description: "Order #ORD-1048 delivered successfully.",
    time: "38 min ago",
    icon: <FiCheckCircle />,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
];

const RecentActivities = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Recent Activities
          </h2>

          <p className="text-gray-500 mt-1">Latest restaurant activities</p>
        </div>

        <button className="text-blue-600 hover:text-blue-700 font-semibold transition">
          View All
        </button>
      </div>

      {/* Timeline */}

      <div className="max-h-[560px] overflow-y-auto p-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line */}

            {index !== activities.length - 1 && (
              <div className="absolute left-6 top-14 w-0.5 h-full bg-gray-200"></div>
            )}

            {/* Icon */}

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.bg} ${activity.color} flex-shrink-0 z-10`}
            >
              {activity.icon}
            </div>

            {/* Content */}

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h3 className="font-semibold text-gray-800">
                  {activity.title}
                </h3>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}

      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing latest {activities.length} activities
        </div>

        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition">
          Activity Log
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
