// src/pos/components/MenuBrowser.jsx
import { useEffect, useMemo, useState } from "react";
import { getCategories, getMenuItems } from "../api/posApi";

const FOOD_TYPE_DOT = {
  VEG: "bg-green-600",
  NON_VEG: "bg-red-600",
  EGG: "bg-amber-500",
};

const ALL_CATEGORY_ID = null;

export default function MenuBrowser({ onAddItem }) {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_CATEGORY_ID);
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getMenuItems({ status: "ACTIVE", ...(activeCategoryId ? { categoryId: activeCategoryId } : {}) })
      .then((data) => {
        setItems(data);
        if (!activeCategoryId) setAllItems(data);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategoryId]);

  const visibleItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dish or SKU…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategoryId(ALL_CATEGORY_ID)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategoryId === ALL_CATEGORY_ID
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategoryId(c.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategoryId === c.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading menu…</div>
      ) : visibleItems.length === 0 ? (
        <div className="text-sm text-slate-400">No items in this category yet.</div>
      ) : (
        <div className="grid flex-1 auto-rows-min content-start grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onAddItem(item)}
              disabled={!item.isAvailable}
              className="group relative flex h-[140px] flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className={`absolute right-3 top-3 h-2 w-2 shrink-0 rounded-full ${
                  FOOD_TYPE_DOT[item.foodType] || "bg-slate-400"
                }`}
              />
              <span className="line-clamp-2 pr-4 text-sm font-semibold text-slate-900">{item.name}</span>
              <span className="mt-1 font-mono text-xs text-slate-400">{item.sku}</span>
              <div className="mt-auto flex items-end justify-between pt-2">
                <span className="font-mono text-base font-semibold text-blue-600">
                  ₹{Number(item.sellingPrice).toFixed(0)}
                </span>
                {!item.isAvailable && (
                  <span className="text-xs font-medium text-red-500">Unavailable</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}