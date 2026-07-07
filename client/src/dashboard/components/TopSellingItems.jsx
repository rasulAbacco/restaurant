// ==============================================
// src/dashboard/components/TopSellingItems.jsx
// ==============================================

import React from "react";
import {
  FiTrendingUp,
  FiStar,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";

const items = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Main Course",
    sold: 186,
    revenue: 65100,
    rating: 4.9,
    growth: "+18%",
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 2,
    name: "Veg Pizza",
    category: "Pizza",
    sold: 142,
    revenue: 49680,
    rating: 4.8,
    growth: "+14%",
    color: "bg-red-100 text-red-600",
  },
  {
    id: 3,
    name: "Cold Coffee",
    category: "Beverages",
    sold: 128,
    revenue: 19200,
    rating: 4.7,
    growth: "+11%",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    name: "Paneer Tikka",
    category: "Starter",
    sold: 109,
    revenue: 32700,
    rating: 4.8,
    growth: "+9%",
    color: "bg-green-100 text-green-600",
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    category: "Dessert",
    sold: 91,
    revenue: 18200,
    rating: 4.9,
    growth: "+21%",
    color: "bg-purple-100 text-purple-600",
  },
];

const TopSellingItems = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Top Selling Items
          </h2>

          <p className="text-gray-500 mt-1">Best performing menu items today</p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
          <FiTrendingUp size={28} />
        </div>
      </div>

      {/* List */}

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={item.id} className="p-5 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${item.color}`}
                  >
                    <FiShoppingBag />
                  </div>

                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>

                  <p className="text-sm text-gray-500 mt-1">{item.category}</p>

                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    <FiStar className="fill-current" />

                    <span className="text-sm font-medium text-gray-700">
                      {item.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <h4 className="text-xl font-bold text-gray-800">
                  ₹{item.revenue.toLocaleString("en-IN")}
                </h4>

                <p className="text-sm text-gray-500 mt-1">{item.sold} Sold</p>

                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  {item.growth}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}

      <div className="grid grid-cols-3 border-t border-gray-100">
        <div className="text-center py-5">
          <p className="text-sm text-gray-500">Total Sold</p>

          <h3 className="text-2xl font-bold mt-2">
            {items.reduce((sum, item) => sum + item.sold, 0)}
          </h3>
        </div>

        <div className="text-center py-5 border-x border-gray-100">
          <p className="text-sm text-gray-500">Revenue</p>

          <h3 className="text-2xl font-bold mt-2">
            ₹
            {items
              .reduce((sum, item) => sum + item.revenue, 0)
              .toLocaleString("en-IN")}
          </h3>
        </div>

        <div className="text-center py-5">
          <p className="text-sm text-gray-500">Avg Rating</p>

          <h3 className="text-2xl font-bold mt-2">4.8⭐</h3>
        </div>
      </div>

      {/* Footer */}

      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
          <FiTrendingUp />
          Sales Increasing
        </div>

        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition">
          View Menu Analytics
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default TopSellingItems;
