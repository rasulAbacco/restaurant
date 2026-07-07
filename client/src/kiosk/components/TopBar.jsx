// ==============================================
// src/kiosk/components/TopBar.jsx
// ==============================================

import React, { useEffect, useState } from "react";
import { FiSearch, FiShoppingCart, FiGlobe, FiClock } from "react-icons/fi";

const TopBar = ({ search, setSearch, cartCount = 0 }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-[90px] bg-white border-b border-gray-200 shadow-sm px-8 flex items-center justify-between">
      {/* Left */}

      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl">
          🍽️
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurant ERP</h1>

          <p className="text-gray-500">Self Ordering Kiosk</p>
        </div>
      </div>

      {/* Search */}

      <div className="flex-1 max-w-2xl mx-16">
        <div className="relative">
          <FiSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            size={24}
          />

          <input
            type="text"
            placeholder="Search your favorite food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 rounded-2xl border border-gray-300 bg-gray-50 pl-16 pr-6 text-xl outline-none focus:border-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-8">
        {/* Language */}

        <button className="flex items-center gap-3 px-5 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          <FiGlobe size={22} />

          <span className="font-semibold">English</span>
        </button>

        {/* Time */}

        <div className="flex items-center gap-3 px-5 h-14 rounded-xl bg-gray-100">
          <FiClock size={22} />

          <span className="font-semibold">{time.toLocaleTimeString()}</span>
        </div>

        {/* Cart */}

        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center">
            <FiShoppingCart size={28} />
          </div>

          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
              {cartCount}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
