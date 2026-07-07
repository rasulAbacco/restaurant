// ==============================================
// src/dashboard/components/StatCard.jsx
// ==============================================

import React from "react";
import { FiArrowUp, FiArrowDown, FiTrendingUp } from "react-icons/fi";

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
    trend: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    border: "border-green-200",
    trend: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    border: "border-red-200",
    trend: "text-red-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    border: "border-orange-200",
    trend: "text-orange-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    border: "border-purple-200",
    trend: "text-purple-600",
  },
};

const StatCard = ({
  title,
  value,
  icon,
  color = "blue",
  change = "",
  changeType = "up", // up | down
  subtitle = "",
  loading = false,
  onClick,
}) => {
  const theme = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative
        overflow-hidden
        bg-white
        rounded-2xl
        border
        ${theme.border}
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        p-6
        group
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Background Decoration */}

      <div
        className={`
          absolute
          -right-8
          -top-8
          w-28
          h-28
          rounded-full
          opacity-10
          ${theme.bg}
        `}
      />

      {/* Content */}

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="mt-3 text-3xl font-bold text-gray-800">{value}</h2>

          {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}

          {change && (
            <div className="mt-5 flex items-center gap-2">
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  changeType === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {changeType === "up" ? <FiArrowUp /> : <FiArrowDown />}

                {change}
              </div>

              <span className="text-sm text-gray-400">vs yesterday</span>
            </div>
          )}
        </div>

        {/* Icon */}

        <div
          className={`
            w-16
            h-16
            rounded-2xl
            flex
            items-center
            justify-center
            text-3xl
            shadow-sm
            transition-transform
            duration-300
            group-hover:scale-110
            ${theme.icon}
          `}
        >
          {icon}
        </div>
      </div>

      {/* Bottom Accent */}

      <div
        className={`
          mt-6
          pt-4
          border-t
          border-gray-100
          flex
          items-center
          justify-between
        `}
      >
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiTrendingUp className={theme.trend} />
          Live Statistics
        </div>

        <span className="text-xs text-gray-400">Updated now</span>
      </div>
    </div>
  );
};

export default StatCard;
