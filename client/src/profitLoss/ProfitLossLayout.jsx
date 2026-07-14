// ==============================================
// client/src/profitLoss/ProfitLossLayout.jsx
// ==============================================
// Tab shell for the P&L module.
//
// IMPORTANT: tabs are plain local state, NOT nested react-router <Route>s.
// The previous version nested <Route>/<Outlet>/<NavLink> two layout-levels
// deep (ProtectedRoute -> ProfitLossLayout -> tab), which is a known source
// of blank pages: relative NavLink targets inside pathless layout routes
// don't resolve consistently across react-router-dom versions, and if the
// URL doesn't match on the first render it falls through to App.jsx's
// catch-all `<Route path="*" element={<Navigate to="/dashboard" />} />` —
// which is exactly the "blank flash then layout switches" symptom. Switching
// to state-based tabs removes that failure mode entirely: there's no route
// transition at all when you click a tab, so there's nothing to mis-match.
//
// Manager only sees the Overview tab (matches the backend's SUMMARY_ACCESS
// routes); Owner/Admin see everything (matches FULL_ACCESS routes).

import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import OverviewTab from "./OverviewTab";
import CategoryItemProfitTab from "./CategoryItemProfitTab";
import CostAnalysisTab from "./CostAnalysisTab";
import DiscountsRefundsTaxTab from "./DiscountsRefundsTaxTab";
import ReportsTab from "./ReportsTab";

const FULL_ACCESS_ROLES = ["OWNER", "ADMIN"];

const TABS = [
  {
    key: "overview",
    label: "Overview",
    Component: OverviewTab,
    fullAccessOnly: false,
  },
  {
    key: "profit-by-item",
    label: "Category & Item Profit",
    Component: CategoryItemProfitTab,
    fullAccessOnly: true,
  },
  {
    key: "cost-analysis",
    label: "Food Cost & Wastage",
    Component: CostAnalysisTab,
    fullAccessOnly: true,
  },
  {
    key: "discounts-refunds-tax",
    label: "Discounts, Refunds & Tax",
    Component: DiscountsRefundsTaxTab,
    fullAccessOnly: true,
  },
  {
    key: "reports",
    label: "Reports & Export",
    Component: ReportsTab,
    fullAccessOnly: true,
  },
];

const ProfitLossLayout = () => {
  const { user } = useAuth();
  const isFullAccess = FULL_ACCESS_ROLES.includes(user?.role);

  const visibleTabs = TABS.filter((tab) => !tab.fullAccessOnly || isFullAccess);

  const [activeKey, setActiveKey] = useState(visibleTabs[0]?.key ?? "overview");

  // Defensive: if the visible tab set shrinks (e.g. role resolves to
  // MANAGER after an initial render) and the active tab is no longer
  // visible, fall back to the first visible tab instead of rendering
  // nothing.
  useEffect(() => {
    if (!visibleTabs.some((t) => t.key === activeKey)) {
      setActiveKey(visibleTabs[0]?.key ?? "overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullAccess]);

  const activeTab =
    visibleTabs.find((t) => t.key === activeKey) || visibleTabs[0];
  const ActiveComponent = activeTab?.Component ?? OverviewTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 lg:px-8 pt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Profit &amp; Loss
        </h1>

        <nav className="flex flex-wrap gap-1 -mb-px">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab?.key === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {!isFullAccess && (
          <p className="pb-3 text-xs text-gray-400">
            You're viewing summary-level financials. Detailed cost, tax, and
            export tools are restricted to Owner/Admin accounts.
          </p>
        )}
      </div>

      <div className="p-6 lg:p-8">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default ProfitLossLayout;
