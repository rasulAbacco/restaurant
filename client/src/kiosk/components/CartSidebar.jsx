// ==============================================
// src/kiosk/components/CartSidebar.jsx
// ==============================================

import React from "react";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
  FiPackage,
} from "react-icons/fi";

const CartSidebar = ({
  cart = [],
  total = 0,
  totalItems = 0,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}) => {
  const gst = Math.round(total * 0.05);
  const grandTotal = total + gst;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}

      <div className="h-24 border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <FiShoppingCart size={26} className="text-orange-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>

            <p className="text-gray-500">{totalItems} Items</p>
          </div>
        </div>
      </div>

      {/* Empty Cart */}

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-36 h-36 rounded-full bg-orange-100 flex items-center justify-center">
            <FiPackage size={70} className="text-orange-500" />
          </div>

          <h3 className="mt-8 text-3xl font-bold text-gray-700">
            Cart is Empty
          </h3>

          <p className="text-center text-gray-500 mt-4 leading-7">
            Add delicious food from the menu to begin your order.
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-2xl p-4"
              >
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {item.name}
                    </h3>

                    <p className="text-orange-600 font-bold mt-2">
                      ₹{item.price}
                    </p>

                    {/* Quantity */}

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <FiMinus />
                      </button>

                      <span className="text-lg font-bold w-8 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center"
                      >
                        <FiPlus />
                      </button>

                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bill Summary */}

          <div className="border-t border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>

                <span className="font-semibold">₹{total}</span>
              </div>

              <div className="flex justify-between text-lg">
                <span className="text-gray-600">GST (5%)</span>

                <span className="font-semibold">₹{gst}</span>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <span className="text-2xl font-bold">Total</span>

                <span className="text-3xl font-bold text-orange-600">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Checkout */}

            <button
              onClick={onCheckout}
              className="mt-8 w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl flex items-center justify-center gap-3 transition"
            >
              Continue
              <FiArrowRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSidebar;
