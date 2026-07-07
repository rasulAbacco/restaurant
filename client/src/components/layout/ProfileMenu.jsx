// ==============================================
// src/components/layout/ProfileMenu.jsx
// ==============================================

import React, { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import {
  FiChevronDown,
  FiUser,
  FiSettings,
  FiLock,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../../auth/AuthContext";

const ProfileMenu = () => {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  // ==========================================
  // CLOSE ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* PROFILE BUTTON */}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:shadow-md transition-all"
      >
        <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
          {user?.name?.charAt(0) || "R"}
        </div>

        <div className="hidden md:block text-left">
          <h4 className="font-semibold text-gray-800">
            {user?.name || "Restaurant User"}
          </h4>

          <p className="text-sm text-gray-500">{user?.role || "OWNER"}</p>
        </div>

        <FiChevronDown
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {/* ================= DROPDOWN ================= */}

      {open && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[320px] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* USER INFO */}

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0) || "R"}
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {user?.name || "Restaurant User"}
                </h3>

                <p className="text-blue-100">
                  {user?.email || "owner@restaurant.com"}
                </p>

                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-white/20 text-sm">
                  {user?.role || "OWNER"}
                </span>
              </div>
            </div>
          </div>

          {/* MENU */}

          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FiUser />
              </div>

              <div>
                <h4 className="font-medium text-gray-800">My Profile</h4>

                <p className="text-sm text-gray-500">View and update profile</p>
              </div>
            </Link>

            <Link
              to="/change-password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <FiLock />
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Change Password</h4>

                <p className="text-sm text-gray-500">Update your password</p>
              </div>
            </Link>

            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <FiSettings />
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Settings</h4>

                <p className="text-sm text-gray-500">
                  Manage application settings
                </p>
              </div>
            </Link>

            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <FiHelpCircle />
              </div>

              <div>
                <h4 className="font-medium text-gray-800">Help & Support</h4>

                <p className="text-sm text-gray-500">Documentation & Contact</p>
              </div>
            </Link>

            <div className="border-t border-gray-100 my-2" />
            {/* ================= LOGOUT ================= */}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <FiLogOut />
              </div>

              <div className="text-left">
                <h4 className="font-medium">Logout</h4>

                <p className="text-sm text-red-400">
                  Sign out from your account
                </p>
              </div>
            </button>
          </div>

          {/* ================= FOOTER ================= */}

          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Restaurant ERP</p>

                <p className="text-sm font-semibold text-gray-700">
                  Version 1.0.0
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>

                <span className="text-xs font-medium text-green-600">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;