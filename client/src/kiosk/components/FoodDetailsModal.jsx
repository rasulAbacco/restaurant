// ==============================================
// src/kiosk/components/FoodDetailsModal.jsx
// ==============================================

import React, { useEffect, useState } from "react";
import { FiX, FiPlus, FiMinus, FiClock, FiStar } from "react-icons/fi";

const FoodDetailsModal = ({ open, food, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const [extraCheese, setExtraCheese] = useState(false);
  const [extraSauce, setExtraSauce] = useState(false);
  const [spice, setSpice] = useState("Medium");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setExtraCheese(false);
      setExtraSauce(false);
      setSpice("Medium");
      setNotes("");
    }
  }, [open]);

  if (!open || !food) return null;

  const extras = (extraCheese ? 40 : 0) + (extraSauce ? 20 : 0);

  const total = (food.price + extras) * quantity;

  const handleAdd = () => {
    onAddToCart(
      {
        ...food,
        extras: {
          extraCheese,
          extraSauce,
          spice,
          notes,
        },
        price: food.price + extras,
      },
      quantity,
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-10">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[92vh] overflow-hidden shadow-2xl">
        {/* Header */}

        <div className="h-20 border-b px-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Customize Your Order</h2>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition"
          >
            <FiX size={28} />
          </button>
        </div>

        {/* Body */}

        <div className="grid grid-cols-2 h-[calc(92vh-170px)]">
          {/* Left */}

          <div className="p-8 overflow-y-auto">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-96 rounded-3xl object-cover"
            />

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full ${food.veg ? "bg-green-600" : "bg-red-600"}`}
                />

                <span className="font-semibold">
                  {food.veg ? "Veg" : "Non-Veg"}
                </span>
              </div>

              <h1 className="text-5xl font-bold mt-4">{food.name}</h1>

              <p className="mt-5 text-gray-600 text-xl leading-9">
                {food.description}
              </p>

              <div className="flex gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <FiStar className="text-yellow-500 fill-current" />

                  <span>{food.rating}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FiClock />

                  <span>15 Minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}

          <div className="bg-gray-50 p-8 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Customize</h3>

            {/* Addons */}

            <div className="space-y-5">
              <label className="flex justify-between items-center bg-white p-5 rounded-2xl">
                <span className="text-lg font-medium">Extra Cheese</span>

                <div className="flex items-center gap-5">
                  <span>+ ₹40</span>

                  <input
                    type="checkbox"
                    checked={extraCheese}
                    onChange={() => setExtraCheese(!extraCheese)}
                    className="w-6 h-6"
                  />
                </div>
              </label>

              <label className="flex justify-between items-center bg-white p-5 rounded-2xl">
                <span className="text-lg font-medium">Extra Sauce</span>

                <div className="flex items-center gap-5">
                  <span>+ ₹20</span>

                  <input
                    type="checkbox"
                    checked={extraSauce}
                    onChange={() => setExtraSauce(!extraSauce)}
                    className="w-6 h-6"
                  />
                </div>
              </label>
            </div>

            {/* Spice */}

            <div className="mt-10">
              <h4 className="font-bold text-xl mb-4">Spice Level</h4>

              <div className="grid grid-cols-3 gap-4">
                {["Mild", "Medium", "Hot"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpice(level)}
                    className={`h-14 rounded-xl font-semibold transition ${
                      spice === level
                        ? "bg-orange-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}

            <div className="mt-10">
              <h4 className="font-bold text-xl mb-4">Special Instructions</h4>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Example: No Onion, Less Salt..."
                className="w-full rounded-2xl border p-5 resize-none"
              />
            </div>

            {/* Quantity */}

            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-14 h-14 rounded-xl bg-white border flex items-center justify-center"
                >
                  <FiMinus />
                </button>

                <span className="text-3xl font-bold">{quantity}</span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 rounded-xl bg-orange-500 text-white flex items-center justify-center"
                >
                  <FiPlus />
                </button>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Total</p>

                <h2 className="text-4xl font-bold text-orange-600">₹{total}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="h-24 border-t px-8 flex items-center justify-between">
          <div>
            <p className="text-gray-500">Grand Total</p>

            <h2 className="text-4xl font-bold text-orange-600">₹{total}</h2>
          </div>

          <button
            onClick={handleAdd}
            className="h-16 px-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold transition"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
