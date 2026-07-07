// ==============================================
// src/kiosk/components/IdleScreen.jsx
// ==============================================

import React, { useEffect, useState } from "react";
import { FiCoffee, FiArrowRight, FiClock } from "react-icons/fi";

const banners = [
  {
    id: 1,
    title: "Today's Special",
    subtitle: "Chicken Biryani",
    price: "₹199",
    offer: "Buy 1 Get 1 Free",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d29a?w=1200",
  },
  {
    id: 2,
    title: "Weekend Combo",
    subtitle: "Burger + Fries + Coke",
    price: "₹299",
    offer: "Save ₹120",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200",
  },
  {
    id: 3,
    title: "Pizza Festival",
    subtitle: "Any Large Pizza",
    price: "₹399",
    offer: "Free Garlic Bread",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
  },
];

const IdleScreen = ({ onStart }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    const clock = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(slider);
      clearInterval(clock);
    };
  }, []);

  const banner = banners[currentBanner];

  return (
    <div
      onClick={onStart}
      className="w-screen h-screen overflow-hidden relative bg-black cursor-pointer select-none"
    >
      {/* Background */}

      <img
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60" />

      {/* Header */}

      <div className="absolute top-0 left-0 right-0 px-12 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center">
            <FiCoffee size={34} className="text-black" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white">Restaurant ERP</h1>

            <p className="text-gray-300 text-lg mt-1">Self Ordering Kiosk</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-white text-2xl">
          <FiClock />

          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Center */}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
        <span className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-xl mb-8">
          {banner.offer}
        </span>

        <h2 className="text-7xl font-extrabold text-white">{banner.title}</h2>

        <h3 className="text-5xl font-semibold text-yellow-300 mt-6">
          {banner.subtitle}
        </h3>

        <div className="mt-8 text-6xl font-bold text-green-400">
          {banner.price}
        </div>
      </div>

      {/* Bottom */}

      <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center">
        <div className="animate-bounce flex items-center gap-4 bg-yellow-400 text-black px-10 py-5 rounded-full shadow-2xl">
          <span className="text-3xl font-bold">Touch Anywhere To Start</span>

          <FiArrowRight size={34} />
        </div>

        <div className="flex gap-3 mt-10">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all duration-500 ${
                currentBanner === index
                  ? "w-14 bg-yellow-400"
                  : "w-3 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdleScreen;
