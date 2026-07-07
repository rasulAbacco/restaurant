// ==============================================
// src/kiosk/components/FoodCard.jsx
// ==============================================

import React from "react";
import { FiPlus, FiClock, FiStar } from "react-icons/fi";

const FoodCard = ({ food, onFoodClick, onAddToCart }) => {
  if (!food) return null;

  return (
    <div
      onClick={() => onFoodClick(food)}
      className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    >
      {/* =========================
          IMAGE
      ========================= */}

      <div className="relative h-60 overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* Veg / Non Veg */}

        <div className="absolute top-4 left-4">
          {food.veg ? (
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-600"></span>

              <span className="font-semibold text-sm">Veg</span>
            </div>
          ) : (
            <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-600"></span>

              <span className="font-semibold text-sm">Non-Veg</span>
            </div>
          )}
        </div>

        {/* Bestseller */}

        {food.bestseller && (
          <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            ⭐ Bestseller
          </div>
        )}
      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 line-clamp-1">
          {food.name}
        </h2>

        <p className="mt-3 text-gray-500 line-clamp-2 leading-6 min-h-[48px]">
          {food.description}
        </p>

        {/* Rating */}

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2 text-yellow-500">
            <FiStar className="fill-current" size={18} />

            <span className="font-semibold text-gray-700">{food.rating}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <FiClock />

            <span>15 Min</span>
          </div>
        </div>

        {/* Price */}

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Starting From</p>

            <h3 className="text-3xl font-bold text-orange-600">
              ₹{food.price}
            </h3>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(food);
            }}
            className="w-16 h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
          >
            <FiPlus size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
