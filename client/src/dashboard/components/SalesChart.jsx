// ==============================================
// src/dashboard/components/SalesChart.jsx
// ==============================================

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiTrendingUp, FiCalendar } from "react-icons/fi";

const dailyData = [
  { name: "Mon", sales: 12500 },
  { name: "Tue", sales: 18200 },
  { name: "Wed", sales: 16400 },
  { name: "Thu", sales: 21500 },
  { name: "Fri", sales: 27800 },
  { name: "Sat", sales: 35400 },
  { name: "Sun", sales: 30100 },
];

const weeklyData = [
  { name: "Week 1", sales: 145000 },
  { name: "Week 2", sales: 169000 },
  { name: "Week 3", sales: 184000 },
  { name: "Week 4", sales: 201000 },
];

const monthlyData = [
  { name: "Jan", sales: 520000 },
  { name: "Feb", sales: 610000 },
  { name: "Mar", sales: 580000 },
  { name: "Apr", sales: 720000 },
  { name: "May", sales: 695000 },
  { name: "Jun", sales: 810000 },
];

const SalesChart = () => {
  const [period, setPeriod] = useState("daily");

  const data = useMemo(() => {
    switch (period) {
      case "weekly":
        return weeklyData;

      case "monthly":
        return monthlyData;

      default:
        return dailyData;
    }
  }, [period]);

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  const averageSales = Math.round(totalSales / data.length);

  const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Overview</h2>

          <p className="text-gray-500 mt-1">
            Revenue analytics and sales performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["daily", "weekly", "monthly"].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`px-4 py-2 rounded-xl capitalize transition-all ${
                period === item
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-5 border-b border-gray-100">
        <div>
          <p className="text-gray-500 text-sm">Total Sales</p>

          <h3 className="text-3xl font-bold mt-2 text-gray-800">
            {formatCurrency(totalSales)}
          </h3>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Average</p>

          <h3 className="text-3xl font-bold mt-2 text-gray-800">
            {formatCurrency(averageSales)}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
            <FiTrendingUp size={26} />
          </div>

          <div>
            <p className="text-gray-500 text-sm">Growth</p>

            <h3 className="text-2xl font-bold text-green-600">+18.6%</h3>
          </div>
        </div>
      </div>

      {/* Chart */}

      <div className="h-[420px] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />

                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            <XAxis dataKey="name" tick={{ fill: "#6B7280" }} />

            <YAxis
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              tick={{ fill: "#6B7280" }}
            />

            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelStyle={{
                color: "#111827",
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 px-6 py-5">
        <div className="flex items-center gap-2 text-gray-500">
          <FiCalendar />
          Updated just now
        </div>

        <div className="text-sm text-green-600 font-semibold">
          Revenue is increasing compared to the previous period.
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
