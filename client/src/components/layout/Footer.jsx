// ==============================================
// src/components/layout/Footer.jsx
// ==============================================

import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMail, FiPhone, FiGlobe } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Left */}

          <div className="text-center lg:text-left">
            <h3 className="text-lg font-bold text-blue-600">Restaurant ERP</h3>

            <p className="text-sm text-gray-500 mt-1">
              Complete Restaurant Management System
            </p>

            <p className="text-sm text-gray-400 mt-2">
              © {currentYear} Restaurant ERP. All Rights Reserved.
            </p>
          </div>

          {/* Center */}

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>

            <Link
              to="/reports"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Reports
            </Link>

            <Link
              to="/settings"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Settings
            </Link>

            <Link
              to="/help"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Help
            </Link>
          </div>

          {/* Right */}

          <div className="flex flex-col items-center lg:items-end gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail />
              support@restauranterp.com
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone />
              +91 98765 43210
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FiGlobe />
              www.restauranterp.com
            </div>
          </div>
        </div>

        {/* Bottom */}

        <div className="border-t border-gray-100 mt-5 pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Built with
            <FiHeart className="text-red-500" />
            for Restaurant Owners
          </p>

          <p className="text-xs text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
