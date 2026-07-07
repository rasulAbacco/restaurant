// ==============================================
// src/kiosk/components/FoodGrid.jsx
// ==============================================

import React from "react";
import { FiSearch, FiCoffee } from "react-icons/fi";

import FoodCard from "./FoodCard";

const FoodGrid = ({ foods = [], onFoodClick, onAddToCart }) => {
  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!foods.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
            <FiSearch size={60} className="text-orange-500" />
          </div>

          <h2 className="mt-8 text-4xl font-bold text-gray-800">
            No Food Found
          </h2>

          <p className="mt-4 text-gray-500 text-xl max-w-lg">
            Try searching for another item or select a different category.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRID
  // ==========================================

  return (
    <div>
      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Our Menu</h2>

          <p className="text-gray-500 mt-2">Freshly prepared delicious meals</p>
        </div>

        <div className="flex items-center gap-3 bg-orange-50 px-5 py-3 rounded-xl">
          <FiCoffee className="text-orange-600" size={22} />

          <span className="font-semibold text-orange-700">
            {foods.length} Items
          </span>
        </div>
      </div>

      {/* Grid */}

      <div
        className="
          grid
          grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
          gap-8
        "
      >
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            onFoodClick={onFoodClick}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodGrid;
