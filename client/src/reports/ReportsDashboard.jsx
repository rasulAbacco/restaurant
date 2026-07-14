// ==============================================
// src/reports/ReportsDashboard.jsx
// ==============================================
// Reports & Analytics — full module redesign.
// Supports light + dark mode (toggle in the header).
//
// Requires:
//   npm i recharts
//   tailwind.config.js -> darkMode: 'class'
// ==============================================

import React, { useState, useMemo } from "react";
import {
  FiBarChart2,
  FiDownload,
  FiPrinter,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiBox,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiPieChart,
  FiActivity,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiTruck,
  FiCoffee,
  FiAlertTriangle,
  FiSun,
  FiMoon,
  FiPercent,
  FiGift,
  FiRotateCcw,
  FiCalendar,
  FiAward,
  FiChevronRight,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import PageHeader from "../components/layout/PageHeader";

/* ────────────────────────────────────────────────────────────
   DESIGN TOKENS
   Light bg keeps the app's existing sage tone (#F3F5EE).
   Dark bg is a near-black forest tone so the green accent still
   reads as "this restaurant's green," not a generic dark theme.
──────────────────────────────────────────────────────────────*/
const T = {
  page: "bg-[#F3F5EE] dark:bg-[#0A0F0C]",
  card: "bg-white dark:bg-[#121A15] border border-gray-100 dark:border-[#1E2A22] shadow-sm dark:shadow-none",
  cardHover:
    "hover:shadow-md dark:hover:border-[#2A3B30] transition-all duration-300",
  text: "text-gray-900 dark:text-[#EAF2ED]",
  subtext: "text-gray-500 dark:text-[#8CA396]",
  faint: "text-gray-400 dark:text-[#5F7568]",
  divider: "border-gray-100 dark:border-[#1E2A22]",
  chip: "bg-gray-50 dark:bg-[#182019] border-gray-100 dark:border-[#1E2A22]",
  input:
    "border-gray-200 dark:border-[#22322A] bg-gray-50 dark:bg-[#0F1712] text-gray-900 dark:text-[#EAF2ED] focus:ring-green-500 dark:focus:ring-emerald-500",
  track: "bg-gray-100 dark:bg-[#1B2620]",
};

const GRID = "#e5e7eb";
const GRID_DARK = "#1E2A22";

const ACCENTS = {
  green: { solid: "#059669", soft: "rgba(5,150,105,.15)" },
  blue: { solid: "#3b82f6", soft: "rgba(59,130,246,.15)" },
  violet: { solid: "#8b5cf6", soft: "rgba(139,92,246,.15)" },
  amber: { solid: "#f59e0b", soft: "rgba(245,158,11,.15)" },
  red: { solid: "#ef4444", soft: "rgba(239,68,68,.15)" },
  pink: { solid: "#ec4899", soft: "rgba(236,72,153,.15)" },
  orange: { solid: "#f97316", soft: "rgba(249,115,22,.15)" },
};

/* ────────────────────────────────────────────────────────────
   MOCK DATA — swap for API calls to GET /reports/* endpoints
──────────────────────────────────────────────────────────────*/
const salesTrend = [
  { d: "Mon", sales: 58200, orders: 168 },
  { d: "Tue", sales: 61400, orders: 174 },
  { d: "Wed", sales: 55800, orders: 159 },
  { d: "Thu", sales: 67200, orders: 188 },
  { d: "Fri", sales: 74100, orders: 201 },
  { d: "Sat", sales: 88900, orders: 238 },
  { d: "Sun", sales: 75250, orders: 210 },
];

const weeklyComparison = [
  { d: "Mon", current: 58200, previous: 51000 },
  { d: "Tue", current: 61400, previous: 55200 },
  { d: "Wed", current: 55800, previous: 57900 },
  { d: "Thu", current: 67200, previous: 60100 },
  { d: "Fri", current: 74100, previous: 68300 },
  { d: "Sat", current: 88900, previous: 79800 },
  { d: "Sun", current: 75250, previous: 66900 },
];

const monthlySales = [
  { m: "Feb", revenue: 1420000 },
  { m: "Mar", revenue: 1510000 },
  { m: "Apr", revenue: 1465000 },
  { m: "May", revenue: 1610000 },
  { m: "Jun", revenue: 1725000 },
  { m: "Jul", revenue: 1840000 },
];

const orderTypeData = [
  { name: "Dine In", value: 52, color: ACCENTS.green.solid },
  { name: "Takeaway", value: 28, color: ACCENTS.blue.solid },
  { name: "Delivery", value: 20, color: ACCENTS.violet.solid },
];

const orderStatusData = [
  { status: "Completed", count: 178, color: "bg-emerald-500" },
  { status: "Pending", count: 14, color: "bg-amber-500" },
  { status: "Cancelled", count: 12, color: "bg-red-500" },
  { status: "Refunded", count: 6, color: "bg-gray-400" },
];

const topSelling = [
  {
    item: "Chicken Biryani",
    qty: 1250,
    revenue: "₹3,75,000",
    profit: "₹1,45,000",
    pct: 100,
  },
  {
    item: "Veg Biryani",
    qty: 940,
    revenue: "₹2,82,000",
    profit: "₹98,000",
    pct: 75,
  },
  { item: "Pizza", qty: 730, revenue: "₹2,60,000", profit: "₹88,000", pct: 69 },
  {
    item: "Burger",
    qty: 620,
    revenue: "₹1,74,000",
    profit: "₹63,000",
    pct: 46,
  },
  {
    item: "Fried Rice",
    qty: 560,
    revenue: "₹1,40,000",
    profit: "₹48,000",
    pct: 37,
  },
];

const leastSelling = [
  { item: "Mushroom Soup", qty: 22, revenue: "₹4,400" },
  { item: "Grilled Sandwich", qty: 34, revenue: "₹6,800" },
  { item: "Fruit Custard", qty: 41, revenue: "₹5,330" },
];

const mostProfitable = [
  { item: "Chicken Biryani", margin: "38.6%" },
  { item: "Cold Coffee", margin: "61.2%" },
  { item: "Veg Fried Rice", margin: "44.8%" },
];

const categoryData = [
  {
    category: "Biryani",
    orders: 820,
    revenue: "₹3,80,000",
    pct: 100,
    color: "bg-green-500",
  },
  {
    category: "Pizza",
    orders: 610,
    revenue: "₹2,60,000",
    pct: 68,
    color: "bg-blue-500",
  },
  {
    category: "Chinese",
    orders: 470,
    revenue: "₹1,95,000",
    pct: 51,
    color: "bg-orange-500",
  },
  {
    category: "Desserts",
    orders: 290,
    revenue: "₹82,000",
    pct: 22,
    color: "bg-pink-500",
  },
  {
    category: "Beverages",
    orders: 210,
    revenue: "₹54,000",
    pct: 14,
    color: "bg-purple-500",
  },
];

const paymentData = [
  {
    name: "UPI",
    value: "41%",
    amount: "₹30,852",
    color: "bg-green-500",
    pct: 41,
  },
  {
    name: "Cash",
    value: "32%",
    amount: "₹24,080",
    color: "bg-blue-500",
    pct: 32,
  },
  {
    name: "Card",
    value: "22%",
    amount: "₹16,555",
    color: "bg-amber-500",
    pct: 22,
  },
  {
    name: "Wallet",
    value: "5%",
    amount: "₹3,763",
    color: "bg-purple-500",
    pct: 5,
  },
];

const inventorySummary = [
  { label: "SKUs Tracked", value: "186", tone: "green" },
  { label: "Low Stock", value: "9", tone: "amber" },
  { label: "Out of Stock", value: "3", tone: "red" },
  { label: "Stock Value", value: "₹8.42L", tone: "blue" },
];

const inventoryAlerts = [
  {
    item: "Cheese",
    stock: "0 Kg",
    status: "Out of Stock",
    severity: "critical",
  },
  { item: "Tomato", stock: "4 Kg", status: "Low Stock", severity: "high" },
  { item: "Butter", stock: "3 Kg", status: "Low Stock", severity: "high" },
  { item: "Chicken", stock: "8 Kg", status: "Running Low", severity: "medium" },
  {
    item: "Cooking Oil",
    stock: "6 L",
    status: "Running Low",
    severity: "medium",
  },
];

const wastageData = [
  { item: "Tomato", qty: "3.2 Kg", cost: "₹480", reason: "Spoilage" },
  { item: "Bread", qty: "18 Pcs", cost: "₹360", reason: "Expired" },
  { item: "Chicken", qty: "1.4 Kg", cost: "₹560", reason: "Prep error" },
];

const purchases = [
  {
    supplier: "Fresh Farms Co.",
    date: "12 Jul",
    invoice: "INV-8821",
    amount: "₹24,500",
    gst: "₹1,225",
    status: "Paid",
  },
  {
    supplier: "Dairy Direct",
    date: "11 Jul",
    invoice: "INV-8814",
    amount: "₹9,800",
    gst: "₹490",
    status: "Paid",
  },
  {
    supplier: "Spice World",
    date: "10 Jul",
    invoice: "INV-8790",
    amount: "₹6,200",
    gst: "₹310",
    status: "Pending",
  },
  {
    supplier: "Metro Packaging",
    date: "08 Jul",
    invoice: "INV-8765",
    amount: "₹4,150",
    gst: "₹208",
    status: "Paid",
  },
];

const supplierWise = [
  { name: "Fresh Farms Co.", amount: "₹1,84,000", pct: 100 },
  { name: "Dairy Direct", amount: "₹96,500", pct: 52 },
  { name: "Spice World", amount: "₹58,200", pct: 32 },
  { name: "Metro Packaging", amount: "₹31,000", pct: 17 },
];

const expenses = [
  { name: "Salary", amount: "₹5,60,000", pct: 58, color: "bg-red-500" },
  { name: "Rent", amount: "₹1,50,000", pct: 15, color: "bg-orange-500" },
  { name: "Electricity", amount: "₹85,000", pct: 9, color: "bg-amber-500" },
  { name: "Marketing", amount: "₹65,000", pct: 7, color: "bg-blue-500" },
  { name: "Gas", amount: "₹42,000", pct: 4, color: "bg-gray-500" },
  { name: "Others", amount: "₹18,000", pct: 2, color: "bg-gray-400" },
];

const taxData = [
  { label: "GST Collected", value: "₹6,820" },
  { label: "CGST", value: "₹3,410" },
  { label: "SGST", value: "₹3,410" },
  { label: "IGST", value: "₹0" },
];

const plTrend = [
  { m: "Feb", revenue: 1420000, expenses: 980000, profit: 440000 },
  { m: "Mar", revenue: 1510000, expenses: 1015000, profit: 495000 },
  { m: "Apr", revenue: 1465000, expenses: 1040000, profit: 425000 },
  { m: "May", revenue: 1610000, expenses: 1080000, profit: 530000 },
  { m: "Jun", revenue: 1725000, expenses: 1120000, profit: 605000 },
  { m: "Jul", revenue: 1840000, expenses: 1145000, profit: 695000 },
];

const customerSegments = [
  { title: "New", value: "48", tone: "blue" },
  { title: "Returning", value: "106", tone: "green" },
  { title: "Loyal", value: "62", tone: "violet" },
  { title: "Inactive", value: "18", tone: "red" },
];

const topCustomers = [
  { name: "Rahul Sharma", orders: 82, spend: "₹28,400", tier: "Loyal" },
  { name: "Priya Menon", orders: 65, spend: "₹21,900", tier: "Loyal" },
  { name: "Arjun Iyer", orders: 51, spend: "₹17,200", tier: "Returning" },
];

const birthdayCustomers = [
  { name: "Sneha Kapoor", date: "16 Jul" },
  { name: "Vikram Nair", date: "19 Jul" },
  { name: "Divya Rao", date: "22 Jul" },
];

const employees = [
  {
    name: "Rahul",
    role: "Captain",
    orders: 145,
    sales: "₹82,500",
    attendance: "96%",
    avatar: "R",
  },
  {
    name: "Ajay",
    role: "Cashier",
    orders: 136,
    sales: "₹76,800",
    attendance: "100%",
    avatar: "A",
  },
  {
    name: "Kiran",
    role: "Server",
    orders: 118,
    sales: "₹69,100",
    attendance: "92%",
    avatar: "K",
  },
  {
    name: "Arjun",
    role: "Server",
    orders: 95,
    sales: "₹52,300",
    attendance: "88%",
    avatar: "Ar",
  },
  {
    name: "Vinay",
    role: "Server",
    orders: 88,
    sales: "₹46,000",
    attendance: "94%",
    avatar: "V",
  },
];

const kitchenStats = [
  { label: "Prepared", value: "182", tone: "green" },
  { label: "Pending", value: "18", tone: "amber" },
  { label: "Avg Time", value: "14m", tone: "blue" },
  { label: "Cancelled", value: "4", tone: "red" },
];

const kitchenThroughput = [
  { h: "12pm", orders: 18 },
  { h: "1pm", orders: 34 },
  { h: "2pm", orders: 22 },
  { h: "7pm", orders: 41 },
  { h: "8pm", orders: 52 },
  { h: "9pm", orders: 38 },
];

const refunds = { amount: "₹8,250", count: 6, topReason: "Order delay" };
const discounts = {
  coupons: "₹6,400",
  loyalty: "₹4,900",
  manual: "₹7,300",
  total: "₹18,600",
};
const delivery = {
  orders: 42,
  charges: "₹3,150",
  avgTime: "31 min",
  partner: "Own Fleet",
};

const transactions = [
  {
    invoice: "INV-1001",
    customer: "Rahul Sharma",
    type: "Dine In",
    payment: "UPI",
    amount: "₹860",
    status: "Paid",
    time: "2:34 PM",
  },
  {
    invoice: "INV-1002",
    customer: "Ajay Kumar",
    type: "Takeaway",
    payment: "Cash",
    amount: "₹540",
    status: "Paid",
    time: "2:18 PM",
  },
  {
    invoice: "INV-1003",
    customer: "Kiran Reddy",
    type: "Delivery",
    payment: "Card",
    amount: "₹1,260",
    status: "Paid",
    time: "1:55 PM",
  },
  {
    invoice: "INV-1004",
    customer: "Arjun Patel",
    type: "Dine In",
    payment: "UPI",
    amount: "₹780",
    status: "Paid",
    time: "1:32 PM",
  },
  {
    invoice: "INV-1005",
    customer: "Vinay Rao",
    type: "Delivery",
    payment: "Cash",
    amount: "₹640",
    status: "Pending",
    time: "1:10 PM",
  },
];

/* ────────────────────────────────────────────────────────────
   SHARED SUBCOMPONENTS
──────────────────────────────────────────────────────────────*/
const toneMap = {
  green: {
    bg: "bg-green-50 dark:bg-emerald-500/10",
    text: "text-green-600 dark:text-emerald-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-500 dark:text-red-400",
  },
};

function StatPill({ label, value, tone = "green" }) {
  const t = toneMap[tone] || toneMap.green;
  return (
    <div className={`${t.bg} rounded-xl p-3.5 text-center`}>
      <p className={`text-2xl font-bold ${t.text}`}>{value}</p>
      <p className={`text-xs mt-1 font-medium ${T.subtext}`}>{label}</p>
    </div>
  );
}

function KpiCard({ title, value, change, trend, icon: Icon, accent }) {
  const a = ACCENTS[accent] || ACCENTS.green;
  return (
    <div
      className={`${T.card} rounded-2xl overflow-hidden ${T.cardHover} group`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10"
            style={{
              background: `linear-gradient(135deg, ${a.solid}, ${a.solid}cc)`,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                trend === "up"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {trend === "up" ? (
                <FiArrowUp className="w-3 h-3" />
              ) : (
                <FiArrowDown className="w-3 h-3" />
              )}
              {change}
            </div>
          )}
        </div>
        <h3 className={`text-sm mt-4 font-medium ${T.subtext}`}>{title}</h3>
        <h2 className={`text-2xl font-bold mt-1 tracking-tight ${T.text}`}>
          {value}
        </h2>
      </div>
      <div
        className="h-1 opacity-60 group-hover:opacity-100 transition"
        style={{ background: a.solid }}
      />
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  span = "xl:col-span-3",
  children,
}) {
  return (
    <div className={`${span} ${T.card} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-lg font-bold ${T.text}`}>{title}</h2>
          {subtitle && (
            <p className={`text-sm mt-0.5 ${T.subtext}`}>{subtitle}</p>
          )}
        </div>
        {Icon && <Icon className={`w-5 h-5 ${T.faint}`} />}
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressRow({ label, sub, value, pct, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-sm ${color}`} />
          <span className={`font-semibold text-sm ${T.text}`}>{label}</span>
          {sub && <span className={`text-xs ${T.faint}`}>{sub}</span>}
        </div>
        <span className={`font-bold text-sm ${T.text}`}>{value}</span>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${T.track}`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const severityStyle = {
  critical:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

const chartTooltip = (isDark) => ({
  contentStyle: {
    background: isDark ? "#121A15" : "#fff",
    border: `1px solid ${isDark ? GRID_DARK : GRID}`,
    borderRadius: 12,
    fontSize: 12,
    color: isDark ? "#EAF2ED" : "#111827",
  },
});

const TABS = [
  { id: "overview", label: "Overview", icon: FiBarChart2 },
  { id: "sales", label: "Sales & Payments", icon: FiDollarSign },
  { id: "orders", label: "Orders & Menu", icon: FiShoppingCart },
  { id: "inventory", label: "Inventory & Purchases", icon: FiBox },
  { id: "finance", label: "Expenses & Tax", icon: FiPercent },
  { id: "customers", label: "Customers", icon: FiUsers },
  { id: "team", label: "Employees & Kitchen", icon: FiActivity },
  { id: "pl", label: "Profit & Loss", icon: FiTrendingUp },
];

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────────*/
const ReportsDashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [tab, setTab] = useState("overview");
  const [dateRange, setDateRange] = useState("Today");

  const tt = useMemo(() => chartTooltip(isDark), [isDark]);
  const gridColor = isDark ? GRID_DARK : GRID;
  const axisColor = isDark ? "#5F7568" : "#9ca3af";

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "Dine In":
        return <FiCoffee className="w-4 h-4" />;
      case "Takeaway":
        return <FiShoppingCart className="w-4 h-4" />;
      case "Delivery":
        return <FiTruck className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getOrderTypeStyle = (type) => {
    switch (type) {
      case "Dine In":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "Takeaway":
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
      case "Delivery":
        return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400";
    }
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className={`space-y-6 ${T.page} min-h-screen -m-6 p-6 transition-colors duration-300`}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <PageHeader
            title="Reports & Analytics"
            subtitle="Restaurant business intelligence dashboard"
            icon={<FiBarChart2 />}
          />
          <button
            onClick={() => setIsDark((v) => !v)}
            aria-label="Toggle dark mode"
            className={`${T.card} rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-sm font-medium ${T.text} hover:opacity-80 transition`}
          >
            {isDark ? (
              <FiSun className="w-4 h-4 text-amber-400" />
            ) : (
              <FiMoon className="w-4 h-4 text-gray-500" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>

        {/* ================= TABS ================= */}
        <div className={`${T.card} rounded-2xl p-1.5 flex flex-wrap gap-1`}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-green-600 text-white shadow-sm shadow-green-600/20"
                    : `${T.subtext} hover:bg-gray-50 dark:hover:bg-[#182019]`
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className={`${T.card} rounded-2xl p-4`}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
              >
                Period
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={`mt-1.5 w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:border-transparent transition ${T.input}`}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
              >
                Order Type
              </label>
              <select
                className={`mt-1.5 w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:border-transparent transition ${T.input}`}
              >
                <option>All Types</option>
                <option>Dine In</option>
                <option>Takeaway</option>
                <option>Delivery</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
              >
                Payment
              </label>
              <select
                className={`mt-1.5 w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:border-transparent transition ${T.input}`}
              >
                <option>All Methods</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
              >
                Search
              </label>
              <div className="relative mt-1.5">
                <FiSearch
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${T.faint}`}
                />
                <input
                  placeholder="Invoice or customer..."
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm focus:ring-2 focus:border-transparent transition ${T.input}`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition shadow-sm shadow-green-600/20">
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                className={`border rounded-xl px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition ${T.divider} ${T.text} hover:bg-gray-50 dark:hover:bg-[#182019]`}
              >
                <FiPrinter className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* ================= OVERVIEW ================= */}
        {tab === "overview" && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <KpiCard
                title="Today's Sales"
                value="₹75,250"
                change="+12.4%"
                trend="up"
                icon={FiDollarSign}
                accent="green"
              />
              <KpiCard
                title="Total Orders"
                value="210"
                change="+18"
                trend="up"
                icon={FiShoppingCart}
                accent="blue"
              />
              <KpiCard
                title="Net Profit"
                value="₹29,850"
                change="+8.6%"
                trend="up"
                icon={FiTrendingUp}
                accent="violet"
              />
              <KpiCard
                title="Average Bill"
                value="₹358"
                change="+3.4%"
                trend="up"
                icon={FiCreditCard}
                accent="amber"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`${T.card} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${T.subtext}`}>
                    Customers
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-lg font-bold ${T.text}`}>154</span>
                    <span className="text-xs font-semibold text-green-600 dark:text-emerald-400">
                      +11%
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${T.card} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">
                  <FiBox className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${T.subtext}`}>
                    Inventory Value
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-lg font-bold ${T.text}`}>
                      ₹8.42L
                    </span>
                    <span className="text-xs font-semibold text-red-500">
                      -2%
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${T.card} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${T.subtext}`}>
                    Expenses
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-lg font-bold ${T.text}`}>
                      ₹18,450
                    </span>
                    <span className="text-xs font-semibold text-red-500">
                      -4%
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`${T.card} rounded-xl p-4 flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400">
                  <FiPieChart className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${T.subtext}`}>
                    GST Collected
                  </p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className={`text-lg font-bold ${T.text}`}>
                      ₹6,820
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-emerald-400">
                      +9%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Sales Trend"
                subtitle="Revenue over the last 7 days"
                span="xl:col-span-3"
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                      <defs>
                        <linearGradient
                          id="salesFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={ACCENTS.green.solid}
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor={ACCENTS.green.solid}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="d"
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip {...tt} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke={ACCENTS.green.solid}
                        strokeWidth={2.5}
                        fill="url(#salesFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="By Order Type"
                subtitle="Revenue distribution"
                span="xl:col-span-2"
              >
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {orderTypeData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tt} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {orderTypeData.map((item, i) => (
                    <div key={i} className="text-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full mx-auto mb-1.5"
                        style={{ background: item.color }}
                      />
                      <p className={`text-xs ${T.subtext}`}>{item.name}</p>
                      <p className={`text-sm font-bold ${T.text}`}>
                        {item.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Category Performance"
                subtitle="Orders and revenue by category"
                span="xl:col-span-3"
                action={
                  <button className="text-green-600 dark:text-emerald-400 text-sm font-semibold hover:opacity-80 transition ml-auto">
                    View All
                  </button>
                }
              >
                <div className="space-y-4">
                  {categoryData.map((item, i) => (
                    <ProgressRow
                      key={i}
                      label={item.category}
                      sub={`${item.orders} orders`}
                      value={item.revenue}
                      pct={item.pct}
                      color={item.color}
                    />
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Inventory Alerts"
                subtitle="Items needing attention"
                span="xl:col-span-2"
                icon={FiAlertTriangle}
              >
                <div className="space-y-2.5">
                  {inventoryAlerts.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl border ${severityStyle[item.severity]}`}
                    >
                      <div>
                        <h4 className="font-semibold text-sm">{item.item}</h4>
                        <p className="text-xs opacity-70 mt-0.5">
                          Remaining: {item.stock}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/20">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title="Recent Transactions"
              subtitle="Latest sales activity"
              span="w-full"
              action={
                <button className="text-green-600 dark:text-emerald-400 text-sm font-semibold hover:opacity-80 transition ml-auto flex items-center gap-1">
                  View All <FiChevronRight className="w-4 h-4" />
                </button>
              }
            >
              <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-y bg-gray-50/50 dark:bg-[#0F1712] ${T.divider}`}
                    >
                      {[
                        "Invoice",
                        "Customer",
                        "Type",
                        "Payment",
                        "Time",
                        "Amount",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${T.subtext} ${h === "Amount" ? "text-right" : h === "Payment" || h === "Time" || h === "Status" ? "text-center" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item, i) => (
                      <tr
                        key={i}
                        className={`border-b hover:bg-gray-50/50 dark:hover:bg-[#182019] transition ${T.divider}`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                            {item.invoice}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${T.text}`}
                        >
                          {item.customer}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${getOrderTypeStyle(item.type)}`}
                          >
                            {getOrderTypeIcon(item.type)}
                            {item.type}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 text-center text-sm ${T.subtext}`}
                        >
                          {item.payment}
                        </td>
                        <td
                          className={`px-6 py-4 text-center text-sm ${T.faint}`}
                        >
                          {item.time}
                        </td>
                        <td
                          className={`px-6 py-4 text-right text-sm font-bold ${T.text}`}
                        >
                          {item.amount}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${item.status === "Paid" ? "bg-green-100 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="relative flex flex-col lg:flex-row justify-between gap-8">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold">Business Summary</h2>
                  <p className="mt-2 text-green-100 text-sm leading-relaxed">
                    Restaurant performance overview generated from sales,
                    inventory, customers, employees and financial data.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                  {[
                    { label: "Best Item", value: "Chicken Biryani" },
                    { label: "Best Category", value: "Biryani" },
                    { label: "Refunds", value: refunds.amount },
                    { label: "Discounts", value: discounts.total },
                    { label: "Net Margin", value: "38.4%" },
                    { label: "Growth", value: "12.8%", icon: true },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-green-200 text-xs font-medium">
                        {item.label}
                      </p>
                      <p className="font-bold mt-0.5 flex items-center gap-1.5">
                        {item.icon && <FiArrowUp className="w-4 h-4" />}
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= SALES & PAYMENTS ================= */}
        {tab === "sales" && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <KpiCard
                title="Daily Sales"
                value="₹75,250"
                change="+12.4%"
                trend="up"
                icon={FiDollarSign}
                accent="green"
              />
              <KpiCard
                title="Weekly Sales"
                value="₹4,81,850"
                change="+9.1%"
                trend="up"
                icon={FiCalendar}
                accent="blue"
              />
              <KpiCard
                title="Monthly Sales"
                value="₹18,40,000"
                change="+6.7%"
                trend="up"
                icon={FiTrendingUp}
                accent="violet"
              />
              <KpiCard
                title="Discounts Given"
                value={discounts.total}
                change="-2.1%"
                trend="down"
                icon={FiPercent}
                accent="amber"
              />
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="This Week vs Last Week"
                subtitle="Daily revenue comparison"
                span="xl:col-span-3"
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyComparison}>
                      <CartesianGrid stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="d"
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip {...tt} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        dataKey="previous"
                        name="Previous week"
                        fill={isDark ? "#2A3B30" : "#e5e7eb"}
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="current"
                        name="Current week"
                        fill={ACCENTS.green.solid}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="Monthly Revenue"
                subtitle="Last 6 months"
                span="xl:col-span-2"
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySales}>
                      <CartesianGrid stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="m"
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip {...tt} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={ACCENTS.violet.solid}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Payment Methods"
                subtitle="Distribution by amount"
                span="xl:col-span-2"
                icon={FiCreditCard}
              >
                <div className="space-y-4">
                  {paymentData.map((item, i) => (
                    <ProgressRow
                      key={i}
                      label={item.name}
                      value={`${item.value} · ${item.amount}`}
                      pct={item.pct}
                      color={item.color}
                    />
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl border bg-green-50 dark:bg-emerald-500/10 border-green-100 dark:border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTrendingUp className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-emerald-400">
                      UPI leads payments
                    </span>
                  </div>
                  <p className="text-xs text-green-600/70 dark:text-emerald-400/70">
                    UPI transactions grew 15% compared to last period
                  </p>
                </div>
              </SectionCard>

              <SectionCard
                title="Refunds & Discounts"
                subtitle="Adjustments to gross sales"
                span="xl:col-span-3"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`rounded-xl border p-4 ${T.divider}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FiRotateCcw className="w-4 h-4 text-red-500" />
                      <h4 className={`text-sm font-semibold ${T.text}`}>
                        Refunds
                      </h4>
                    </div>
                    <p className={`text-2xl font-bold ${T.text}`}>
                      {refunds.amount}
                    </p>
                    <p className={`text-xs mt-1 ${T.subtext}`}>
                      {refunds.count} refunds · top reason: {refunds.topReason}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-4 ${T.divider}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FiGift className="w-4 h-4 text-violet-500" />
                      <h4 className={`text-sm font-semibold ${T.text}`}>
                        Discounts
                      </h4>
                    </div>
                    <p className={`text-2xl font-bold ${T.text}`}>
                      {discounts.total}
                    </p>
                    <p className={`text-xs mt-1 ${T.subtext}`}>
                      Coupons {discounts.coupons} · Loyalty {discounts.loyalty}{" "}
                      · Manual {discounts.manual}
                    </p>
                  </div>
                </div>
                <div className={`mt-4 rounded-xl border p-4 ${T.divider}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FiTruck className="w-4 h-4 text-blue-500" />
                    <h4 className={`text-sm font-semibold ${T.text}`}>
                      Delivery
                    </h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className={`text-lg font-bold ${T.text}`}>
                        {delivery.orders}
                      </p>
                      <p className={`text-xs ${T.subtext}`}>Orders</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${T.text}`}>
                        {delivery.charges}
                      </p>
                      <p className={`text-xs ${T.subtext}`}>
                        Charges collected
                      </p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${T.text}`}>
                        {delivery.avgTime}
                      </p>
                      <p className={`text-xs ${T.subtext}`}>
                        Avg delivery time
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ================= ORDERS & MENU ================= */}
        {tab === "orders" && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {orderStatusData.map((s, i) => (
                <div key={i} className={`${T.card} rounded-2xl p-5`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className={`text-sm font-medium ${T.subtext}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${T.text}`}>{s.count}</p>
                </div>
              ))}
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Top Selling Items"
                subtitle="Best performers by quantity"
                span="xl:col-span-3"
              >
                <div className="space-y-3">
                  {topSelling.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#182019] transition"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                            : i === 1
                              ? "bg-gray-100 text-gray-600 dark:bg-[#1B2620] dark:text-[#8CA396]"
                              : i === 2
                                ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                                : "bg-gray-50 text-gray-400 dark:bg-[#141C17] dark:text-[#5F7568]"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-sm truncate ${T.text}`}
                        >
                          {item.item}
                        </h4>
                        <p className={`text-xs mt-0.5 ${T.subtext}`}>
                          {item.qty} sold · Profit {item.profit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${T.text}`}>
                          {item.revenue}
                        </p>
                        <div
                          className={`w-20 h-1.5 rounded-full mt-1.5 overflow-hidden ${T.track}`}
                        >
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Menu Signals"
                subtitle="Least selling & most profitable"
                span="xl:col-span-2"
              >
                <div className="space-y-4">
                  <div>
                    <h4
                      className={`text-xs font-semibold uppercase tracking-wider mb-2 ${T.faint}`}
                    >
                      Least Selling
                    </h4>
                    <div className="space-y-2">
                      {leastSelling.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className={T.text}>{it.item}</span>
                          <span className={T.subtext}>{it.qty} sold</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`pt-4 border-t ${T.divider}`}>
                    <h4
                      className={`text-xs font-semibold uppercase tracking-wider mb-2 ${T.faint}`}
                    >
                      Most Profitable
                    </h4>
                    <div className="space-y-2">
                      {mostProfitable.map((it, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className={T.text}>{it.item}</span>
                          <span className="font-semibold text-green-600 dark:text-emerald-400">
                            {it.margin}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title="Category Performance"
              subtitle="Orders and revenue by category"
              span="w-full"
            >
              <div className="space-y-4">
                {categoryData.map((item, i) => (
                  <ProgressRow
                    key={i}
                    label={item.category}
                    sub={`${item.orders} orders`}
                    value={item.revenue}
                    pct={item.pct}
                    color={item.color}
                  />
                ))}
              </div>
            </SectionCard>
          </>
        )}

        {/* ================= INVENTORY & PURCHASES ================= */}
        {tab === "inventory" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {inventorySummary.map((s, i) => (
                <StatPill
                  key={i}
                  label={s.label}
                  value={s.value}
                  tone={s.tone}
                />
              ))}
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Stock Alerts"
                subtitle="Low & out-of-stock items"
                span="xl:col-span-2"
                icon={FiAlertTriangle}
              >
                <div className="space-y-2.5">
                  {inventoryAlerts.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl border ${severityStyle[item.severity]}`}
                    >
                      <div>
                        <h4 className="font-semibold text-sm">{item.item}</h4>
                        <p className="text-xs opacity-70 mt-0.5">
                          Remaining: {item.stock}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/20">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Wastage Report"
                subtitle="Cost of spoilage & errors"
                span="xl:col-span-3"
              >
                <div className="overflow-x-auto -mx-6 -mb-6">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-y bg-gray-50/50 dark:bg-[#0F1712] ${T.divider}`}
                      >
                        {["Ingredient", "Quantity", "Cost", "Reason"].map(
                          (h) => (
                            <th
                              key={h}
                              className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {wastageData.map((w, i) => (
                        <tr key={i} className={`border-b ${T.divider}`}>
                          <td
                            className={`px-6 py-4 text-sm font-medium ${T.text}`}
                          >
                            {w.item}
                          </td>
                          <td className={`px-6 py-4 text-sm ${T.subtext}`}>
                            {w.qty}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-semibold ${T.text}`}
                          >
                            {w.cost}
                          </td>
                          <td className={`px-6 py-4 text-sm ${T.subtext}`}>
                            {w.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Recent Purchases"
                subtitle="Invoices from suppliers"
                span="xl:col-span-3"
              >
                <div className="overflow-x-auto -mx-6 -mb-6">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-y bg-gray-50/50 dark:bg-[#0F1712] ${T.divider}`}
                      >
                        {[
                          "Supplier",
                          "Date",
                          "Invoice",
                          "Amount",
                          "GST",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${T.subtext}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p, i) => (
                        <tr key={i} className={`border-b ${T.divider}`}>
                          <td
                            className={`px-6 py-4 text-sm font-medium ${T.text}`}
                          >
                            {p.supplier}
                          </td>
                          <td className={`px-6 py-4 text-sm ${T.subtext}`}>
                            {p.date}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-mono ${T.subtext}`}
                          >
                            {p.invoice}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm font-semibold ${T.text}`}
                          >
                            {p.amount}
                          </td>
                          <td className={`px-6 py-4 text-sm ${T.subtext}`}>
                            {p.gst}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.status === "Paid" ? "bg-green-100 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard
                title="Supplier-wise Spend"
                subtitle="Last 30 days"
                span="xl:col-span-2"
              >
                <div className="space-y-4">
                  {supplierWise.map((s, i) => (
                    <ProgressRow
                      key={i}
                      label={s.name}
                      value={s.amount}
                      pct={s.pct}
                      color="bg-blue-500"
                    />
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ================= EXPENSES & TAX ================= */}
        {tab === "finance" && (
          <>
            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Expense Breakdown"
                subtitle="Monthly cost distribution"
                span="xl:col-span-3"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenses.map((e) => ({
                            name: e.name,
                            value: e.pct,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={78}
                          paddingAngle={2}
                        >
                          {expenses.map((e, i) => (
                            <Cell
                              key={i}
                              fill={
                                [
                                  "#ef4444",
                                  "#f97316",
                                  "#f59e0b",
                                  "#3b82f6",
                                  "#6b7280",
                                  "#9ca3af",
                                ][i]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip {...tt} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 self-center">
                    {expenses.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-sm ${item.color}`}
                          />
                          <span className={`text-sm ${T.text}`}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${T.text}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                    <div
                      className={`pt-3 mt-3 border-t flex items-center justify-between ${T.divider}`}
                    >
                      <span className={`text-sm font-medium ${T.subtext}`}>
                        Total
                      </span>
                      <span className={`text-base font-bold ${T.text}`}>
                        ₹9,20,000
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Tax Reports"
                subtitle="This month"
                span="xl:col-span-2"
              >
                <div className="grid grid-cols-2 gap-3">
                  {taxData.map((t, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-3.5 ${T.divider}`}
                    >
                      <p className={`text-xs font-medium ${T.subtext}`}>
                        {t.label}
                      </p>
                      <p className={`text-lg font-bold mt-1 ${T.text}`}>
                        {t.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-[#1B2620] rounded-lg p-0.5 w-fit">
                  {["Daily", "Monthly", "Quarterly", "Annual"].map((p, i) => (
                    <button
                      key={p}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                        i === 1
                          ? "bg-white dark:bg-[#121A15] shadow-sm text-gray-900 dark:text-[#EAF2ED]"
                          : `${T.subtext} hover:opacity-80`
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ================= CUSTOMERS ================= */}
        {tab === "customers" && (
          <div className="grid xl:grid-cols-5 gap-5">
            <SectionCard
              title="Segmentation"
              subtitle="Customer base overview"
              span="xl:col-span-2"
              icon={FiUsers}
            >
              <div className="grid grid-cols-2 gap-3 mb-5">
                {customerSegments.map((c, i) => (
                  <StatPill
                    key={i}
                    label={c.title}
                    value={c.value}
                    tone={c.tone}
                  />
                ))}
              </div>
              <div>
                <h4
                  className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${T.faint}`}
                >
                  <FiGift className="w-3.5 h-3.5" /> Birthdays this week
                </h4>
                <div className="space-y-2">
                  {birthdayCustomers.map((b, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-lg ${T.chip} border`}
                    >
                      <span className={`text-sm ${T.text}`}>{b.name}</span>
                      <span className={`text-xs ${T.subtext}`}>{b.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Top Spending Customers"
              subtitle="Highest lifetime value"
              span="xl:col-span-3"
            >
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#182019] transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-emerald-500/10 text-green-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm ${T.text}`}>
                        {c.name}
                      </h4>
                      <p className={`text-xs mt-0.5 ${T.subtext}`}>
                        {c.orders} orders · {c.tier}
                      </p>
                    </div>
                    <p className="font-bold text-green-600 dark:text-emerald-400 text-sm">
                      {c.spend}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ================= EMPLOYEES & KITCHEN ================= */}
        {tab === "team" && (
          <>
            <SectionCard
              title="Employee Performance"
              subtitle="Orders handled, sales generated and attendance"
              span="w-full"
              icon={FiActivity}
            >
              <div className="space-y-3">
                {employees.map((emp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#182019] transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm ${T.text}`}>
                        {emp.name}
                      </h4>
                      <p className={`text-xs ${T.subtext}`}>{emp.role}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className={`font-bold text-sm ${T.text}`}>
                        {emp.orders}
                      </p>
                      <p className={`text-xs ${T.subtext}`}>orders</p>
                    </div>
                    <div className="text-center px-4 hidden sm:block">
                      <p className={`font-bold text-sm ${T.text}`}>
                        {emp.attendance}
                      </p>
                      <p className={`text-xs ${T.subtext}`}>attendance</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-green-600 dark:text-emerald-400 text-sm">
                        {emp.sales}
                      </p>
                    </div>
                    <div
                      className={`w-24 h-1.5 rounded-full overflow-hidden hidden lg:block ${T.track}`}
                    >
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(emp.orders / 145) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="grid xl:grid-cols-5 gap-5">
              <SectionCard
                title="Kitchen Performance"
                subtitle="Today's kitchen metrics"
                span="xl:col-span-2"
                icon={FiClock}
              >
                <div className="grid grid-cols-2 gap-3">
                  {kitchenStats.map((s, i) => (
                    <StatPill
                      key={i}
                      label={s.label}
                      value={s.value}
                      tone={s.tone}
                    />
                  ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Kitchen Throughput"
                subtitle="Orders prepared by hour"
                span="xl:col-span-3"
              >
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kitchenThroughput}>
                      <CartesianGrid stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="h"
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke={axisColor}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip {...tt} />
                      <Bar
                        dataKey="orders"
                        fill={ACCENTS.green.solid}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* ================= PROFIT & LOSS ================= */}
        {tab === "pl" && (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <KpiCard
                title="Revenue (Jul)"
                value="₹18,40,000"
                change="+6.7%"
                trend="up"
                icon={FiDollarSign}
                accent="green"
              />
              <KpiCard
                title="Expenses (Jul)"
                value="₹11,45,000"
                change="+2.2%"
                trend="down"
                icon={FiActivity}
                accent="red"
              />
              <KpiCard
                title="Gross Profit"
                value="₹9,20,000"
                change="+9.8%"
                trend="up"
                icon={FiTrendingUp}
                accent="blue"
              />
              <KpiCard
                title="Net Profit"
                value="₹6,95,000"
                change="+14.9%"
                trend="up"
                icon={FiAward}
                accent="violet"
              />
            </div>

            <SectionCard
              title="Profit Trend"
              subtitle="Revenue vs expenses vs net profit — last 6 months"
              span="w-full"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={plTrend}>
                    <CartesianGrid stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="m"
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={axisColor}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip {...tt} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke={ACCENTS.blue.solid}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke={ACCENTS.red.solid}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Net Profit"
                      stroke={ACCENTS.green.solid}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
