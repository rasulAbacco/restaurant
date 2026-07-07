// ==============================================
// src/components/layout/PageHeader.jsx
// ==============================================

import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import Breadcrumb from "./Breadcrumb";

const PageHeader = ({
  title,
  subtitle = "",
  icon = null,
  action = null,
  onRefresh = null,
  showRefresh = false,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      {/* Top */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left */}

        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
              {icon}
            </div>
          )}

          <div>
            <Breadcrumb />

            <h1 className="mt-3 text-3xl font-bold text-gray-800">{title}</h1>

            {subtitle && (
              <p className="mt-2 text-gray-500 leading-7 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-3 flex-wrap">
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}

          {action}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
