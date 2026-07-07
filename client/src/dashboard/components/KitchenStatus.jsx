// ==============================================
// src/dashboard/components/KitchenStatus.jsx
// ==============================================

import React from "react";
import {
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiCoffee,
  FiTrendingUp,
} from "react-icons/fi";

const kitchenData = {
  waiting: 8,
  preparing: 14,
  ready: 6,
  completed: 128,
  avgTime: "18 min",
  chefs: 5,
};

const progress = [
  {
    label: "Waiting",
    value: kitchenData.waiting,
    color: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  {
    label: "Preparing",
    value: kitchenData.preparing,
    color: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    label: "Ready",
    value: kitchenData.ready,
    color: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
];

const KitchenStatus = () => {
  const totalActive =
    kitchenData.waiting + kitchenData.preparing + kitchenData.ready;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kitchen Status</h2>

          <p className="text-gray-500 mt-1">Live kitchen activity</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <FiCoffee size={28} />
        </div>
      </div>

      {/* Main Stats */}

      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="rounded-xl bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">Waiting</p>

          <h3 className="text-3xl font-bold mt-2">{kitchenData.waiting}</h3>
        </div>

        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Preparing</p>

          <h3 className="text-3xl font-bold mt-2">{kitchenData.preparing}</h3>
        </div>

        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm text-green-700">Ready</p>

          <h3 className="text-3xl font-bold mt-2">{kitchenData.ready}</h3>
        </div>

        <div className="rounded-xl bg-purple-50 p-4">
          <p className="text-sm text-purple-700">Completed</p>

          <h3 className="text-3xl font-bold mt-2">{kitchenData.completed}</h3>
        </div>
      </div>

      {/* Progress */}

      <div className="px-6 pb-6">
        <h4 className="font-semibold text-gray-700 mb-4">
          Active Kitchen Load
        </h4>

        {progress.map((item) => {
          const percentage =
            totalActive === 0 ? 0 : (item.value / totalActive) * 100;

          return (
            <div key={item.label} className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>

                <span className={`text-sm font-semibold ${item.text}`}>
                  {item.value}
                </span>
              </div>

              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-500`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Statistics */}

      <div className="border-t border-gray-100 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <FiClock className="mx-auto text-blue-600 text-xl mb-2" />

            <p className="text-gray-500 text-sm">Avg Time</p>

            <h4 className="font-bold text-lg mt-1">{kitchenData.avgTime}</h4>
          </div>

          <div className="text-center">
            <FiActivity className="mx-auto text-green-600 text-xl mb-2" />

            <p className="text-gray-500 text-sm">Active Orders</p>

            <h4 className="font-bold text-lg mt-1">{totalActive}</h4>
          </div>

          <div className="text-center">
            <FiTrendingUp className="mx-auto text-orange-600 text-xl mb-2" />

            <p className="text-gray-500 text-sm">Chefs</p>

            <h4 className="font-bold text-lg mt-1">{kitchenData.chefs}</h4>
          </div>
        </div>
      </div>

      {/* Footer */}

      <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCheckCircle className="text-green-600" />
          Kitchen operating normally
        </div>

        <span className="text-xs text-gray-400">Updated just now</span>
      </div>
    </div>
  );
};

export default KitchenStatus;
