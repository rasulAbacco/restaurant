// ==============================================
// src/kiosk/KioskHome.jsx
// ==============================================

import React, { useMemo, useState } from "react";

import TopBar from "./components/TopBar";
import CategorySidebar from "./components/CategorySidebar";
import FoodGrid from "./components/FoodGrid";
import CartSidebar from "./components/CartSidebar";
import FoodDetailsModal from "./components/FoodDetailsModal";

import KioskCheckout from "./KioskCheckout";
import KioskPayment from "./KioskPayment";
import KioskSuccess from "./KioskSuccess";

// ==============================================
// DEMO DATA
// Replace with API later
// ==============================================

const categories = [
  {
    id: 1,
    name: "All",
    icon: "🍽️",
  },
  {
    id: 2,
    name: "Pizza",
    icon: "🍕",
  },
  {
    id: 3,
    name: "Burger",
    icon: "🍔",
  },
  {
    id: 4,
    name: "Biryani",
    icon: "🍛",
  },
  {
    id: 5,
    name: "Chinese",
    icon: "🥡",
  },
  {
    id: 6,
    name: "Drinks",
    icon: "🥤",
  },
  {
    id: 7,
    name: "Dessert",
    icon: "🍰",
  },
];

const foods = [
  {
    id: 1,
    name: "Veg Pizza",
    category: "Pizza",
    price: 299,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
    rating: 4.8,
    veg: true,
    bestseller: true,
    description: "Fresh mozzarella cheese with vegetables.",
  },
  {
    id: 2,
    name: "Chicken Burger",
    category: "Burger",
    price: 249,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    rating: 4.7,
    veg: false,
    bestseller: false,
    description: "Grilled chicken with fresh lettuce.",
  },
  {
    id: 3,
    name: "Chicken Biryani",
    category: "Biryani",
    price: 349,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600",
    rating: 4.9,
    veg: false,
    bestseller: true,
    description: "Authentic Hyderabadi Dum Biryani.",
  },
  {
    id: 4,
    name: "Cold Coffee",
    category: "Drinks",
    price: 149,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
    rating: 4.6,
    veg: true,
    bestseller: false,
    description: "Fresh chilled coffee with ice cream.",
  },
  {
    id: 5,
    name: "Brownie",
    category: "Dessert",
    price: 179,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
    rating: 4.8,
    veg: true,
    bestseller: true,
    description: "Chocolate brownie served hot.",
  },
];

// ==============================================
// COMPONENT
// ==============================================

const KioskHome = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchText, setSearchText] = useState("");

  const [selectedFood, setSelectedFood] = useState(null);

  const [cart, setCart] = useState([]);

  const [showFoodModal, setShowFoodModal] = useState(false);

  // ==========================================
  // CHECKOUT FLOW
  // ==========================================

  const [showCheckout, setShowCheckout] = useState(false);

  const [showPayment, setShowPayment] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [checkoutData, setCheckoutData] = useState({});

  // ==========================================
  // FILTERED FOOD
  // ==========================================

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const categoryMatch =
        selectedCategory === "All" || food.category === selectedCategory;

      const searchMatch = food.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchText]);

  // ==========================================
  // OPEN FOOD
  // ==========================================

  const openFood = (food) => {
    setSelectedFood(food);

    setShowFoodModal(true);
  };

  // ==========================================
  // CLOSE FOOD
  // ==========================================

  const closeFood = () => {
    setSelectedFood(null);

    setShowFoodModal(false);
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (food, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === food.id);

      if (existing) {
        return prev.map((item) =>
          item.id === food.id
            ? {
                ...item,
                quantity: item.quantity + qty,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          ...food,
          quantity: qty,
        },
      ];
    });

    closeFood();
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);

      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  // ==========================================
  // TOTALS
  // ==========================================

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = () => {
    if (cart.length === 0) return;

    setShowCheckout(true);
  };

  // ==========================================
  // RESET KIOSK
  // ==========================================

  const resetKiosk = () => {
    // Cart

    setCart([]);

    // Food

    setSelectedFood(null);

    setShowFoodModal(false);

    // Search

    setSearchText("");

    // Category

    setSelectedCategory("All");

    // Checkout Flow

    setShowCheckout(false);

    setShowPayment(false);

    setShowSuccess(false);

    setCheckoutData({});

    // Future

    // navigate("/kiosk/home");
  };
  // ==========================================
  // PAYMENT SUCCESS
  // ==========================================

  const handlePaymentSuccess = (paymentInfo = {}) => {
    const successOrder = {
      ...checkoutData,

      ...paymentInfo,

      paymentMethod: paymentInfo.paymentMethod || "UPI",

      paymentStatus: "SUCCESS",

      orderNumber: "ORD" + Math.floor(100000 + Math.random() * 900000),

      estimatedTime: Math.floor(Math.random() * 10) + 15,

      orderedAt: new Date(),
    };

    setCheckoutData(successOrder);

    setShowPayment(false);

    setShowSuccess(true);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100">
      {/* ======================================
          TOP BAR
      ====================================== */}

      <TopBar
        search={searchText}
        setSearch={setSearchText}
        cartCount={totalItems}
      />

      {/* ======================================
          MAIN LAYOUT
      ====================================== */}

      <div className="h-[calc(100vh-90px)] flex">
        {/* ======================================
            LEFT SIDEBAR
        ====================================== */}

        <div className="w-72 bg-white border-r border-gray-200">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* ======================================
            CENTER
        ====================================== */}

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Page Header */}

          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {selectedCategory}
                </h1>

                <p className="text-gray-500 mt-2">
                  Browse delicious freshly prepared meals.
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-4xl font-bold text-blue-600">
                  {filteredFoods.length}
                </h2>

                <p className="text-gray-500">Items Available</p>
              </div>
            </div>
          </div>

          {/* Food Grid */}

          <div className="flex-1 overflow-y-auto p-8">
            <FoodGrid
              foods={filteredFoods}
              onFoodClick={openFood}
              onAddToCart={addToCart}
            />
          </div>
        </div>

        {/* ======================================
            CART
        ====================================== */}

        <div className="w-[420px] bg-white border-l border-gray-200">
          <CartSidebar
            cart={cart}
            total={cartTotal}
            totalItems={totalItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
      {/* ======================================
          FOOD DETAILS MODAL
      ====================================== */}

      <FoodDetailsModal
        open={showFoodModal}
        food={selectedFood}
        onClose={closeFood}
        onAddToCart={addToCart}
      />

      {/* ======================================
    CHECKOUT
====================================== */}

      <KioskCheckout
        open={showCheckout}
        cart={cart}
        onClose={() => setShowCheckout(false)}
        onContinue={(checkout) => {
          setCheckoutData(checkout);

          setShowCheckout(false);

          setShowPayment(true);
        }}
      />

      {/* ======================================
    PAYMENT
====================================== */}

      <KioskPayment
        open={showPayment}
        order={checkoutData}
        onBack={() => {
          setShowPayment(false);

          setShowCheckout(true);
        }}
        onSuccess={(paymentData) => {
          handlePaymentSuccess(paymentData);
        }}
      />

      {/* ======================================
    SUCCESS
====================================== */}

      <KioskSuccess
        open={showSuccess}
        order={checkoutData}
        onFinish={() => {
          resetKiosk();
        }}
      />

      {/* ======================================
          EMPTY CART PLACEHOLDER
      ====================================== */}

      {cart.length === 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-pulse pointer-events-none">
          <span className="text-2xl">🛒</span>

          <span className="font-semibold text-lg">
            Select your favorite food to begin your order
          </span>
        </div>
      )}

      {/* ======================================
          DECORATION
      ====================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-orange-400/10 blur-3xl" />
      </div>
    </div>
  );
};

export default KioskHome;
