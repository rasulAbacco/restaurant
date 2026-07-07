// ==============================================
// src/kiosk/components/CategorySidebar.jsx
// ==============================================

import React from "react";
import { FiGrid, FiChevronRight } from "react-icons/fi";

const CategorySidebar = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header */}

      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <FiGrid className="text-orange-600" size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>

            <p className="text-sm text-gray-500">Browse Menu</p>
          </div>
        </div>
      </div>

      {/* Categories */}

      <div className="flex-1 overflow-y-auto py-4">
        {categories.map((category) => {
          const active = selectedCategory === category.name;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.name)}
              className={`
                w-full
                px-5
                py-4
                flex
                items-center
                justify-between
                transition-all
                duration-200
                border-l-4
                ${
                  active
                    ? "bg-orange-50 border-orange-500"
                    : "border-transparent hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-2xl
                    ${active ? "bg-orange-500 text-white" : "bg-gray-100"}
                  `}
                >
                  {category.icon}
                </div>

                <div className="text-left">
                  <h3
                    className={`
                      font-semibold
                      ${active ? "text-orange-600" : "text-gray-800"}
                    `}
                  >
                    {category.name}
                  </h3>
                </div>
              </div>

              <FiChevronRight
                className={active ? "text-orange-500" : "text-gray-300"}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom */}

      <div className="border-t border-gray-200 p-5">
        <div className="rounded-xl bg-orange-50 p-4">
          <h3 className="font-bold text-orange-600">🍽 Freshly Prepared</h3>

          <p className="text-sm text-gray-600 mt-2 leading-6">
            Every order is prepared fresh after you place it.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default CategorySidebar;
