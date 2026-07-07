// client/src/menu/MenuTabs.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FiCoffee, FiGrid } from "react-icons/fi";

const tabs = [
  { label: "Menu Items", to: "/menu", icon: <FiCoffee />, end: true },
  { label: "Categories", to: "/menu/categories", icon: <FiGrid />, end: false },
];

const MenuTabs = () => {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`
          }
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};

export default MenuTabs;