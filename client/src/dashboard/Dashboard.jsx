// ==============================================
// src/dashboard/Dashboard.jsx
// ==============================================

import React from "react";

import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiBox,
} from "react-icons/fi";

import PageHeader from "../components/layout/PageHeader";

import StatCard from "./components/StatCard";
import SalesChart from "./components/SalesChart";
import KitchenStatus from "./components/KitchenStatus";
import RecentOrders from "./components/RecentOrders";
import LowStockAlert from "./components/LowStockAlert";
import PaymentSummary from "./components/PaymentSummary";
import TopSellingItems from "./components/TopSellingItems";
import RecentActivities from "./components/RecentActivities";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Dashboard"
        subtitle="Welcome back! Here's what's happening in your restaurant today."
        icon={<FiShoppingCart />}
      />

      {/* ======================================
          KPI CARDS
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value="₹24,560"
          icon={<FiDollarSign />}
          color="green"
          change="+12.4%"
          changeType="up"
          subtitle="Compared to yesterday"
        />

        <StatCard
          title="Orders Today"
          value="148"
          icon={<FiShoppingCart />}
          color="blue"
          change="+18"
          changeType="up"
          subtitle="Orders received today"
        />

        <StatCard
          title="Customers"
          value="96"
          icon={<FiUsers />}
          color="purple"
          change="+9%"
          changeType="up"
          subtitle="Visited today"
        />

        <StatCard
          title="Low Stock Items"
          value="12"
          icon={<FiBox />}
          color="orange"
          change="-3"
          changeType="down"
          subtitle="Need immediate attention"
        />
      </div>

      {/* ======================================
          CHART + KITCHEN
      ====================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>

        <KitchenStatus />
      </div>
      {/* ======================================
          RECENT ORDERS
      ====================================== */}

      <RecentOrders />

      {/* ======================================
          LOW STOCK + PAYMENT SUMMARY
      ====================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LowStockAlert />

        <PaymentSummary />
      </div>

      {/* ======================================
          TOP SELLING + RECENT ACTIVITIES
      ====================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopSellingItems />

        <RecentActivities />
      </div>
      {/* ======================================
          DASHBOARD SUMMARY
      ====================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6">
          {/* Left */}

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Today's Restaurant Summary
            </h2>

            <p className="text-gray-500 mt-2">
              Overall business performance for today.
            </p>
          </div>

          {/* Right */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Revenue</p>

              <h3 className="text-2xl font-bold text-green-600 mt-2">
                ₹24,560
              </h3>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm">Orders</p>

              <h3 className="text-2xl font-bold text-blue-600 mt-2">148</h3>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm">Customers</p>

              <h3 className="text-2xl font-bold text-purple-600 mt-2">96</h3>
            </div>

            <div className="text-center">
              <p className="text-gray-500 text-sm">Avg. Order</p>

              <h3 className="text-2xl font-bold text-orange-600 mt-2">₹825</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          FOOTER
      ====================================== */}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5">
        <div>
          <h4 className="font-semibold text-gray-800">
            Restaurant ERP Dashboard
          </h4>

          <p className="text-sm text-gray-500 mt-1">
            Live dashboard connected to your restaurant operations.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">Last Updated</p>

            <p className="font-semibold">Just Now</p>
          </div>

          <div className="h-10 w-px bg-gray-200" />

          <div className="text-center">
            <p className="text-xs text-gray-500">Status</p>

            <div className="flex items-center gap-2 justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>

              <span className="font-semibold text-green-600">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;