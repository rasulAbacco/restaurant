import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiArrowRight,
  FiShield,
  FiClock,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";

const Login = () => {
  // ==========================
  // STATES
  // ==========================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const { login } = useAuth();

  // ==========================
  // FEATURES LIST
  // ==========================

  const features = [
    {
      icon: <FiShield className="text-blue-600 text-xl" />,
      title: "Secure Role Based Access",
      description: "Owner, Manager, Cashier and Kitchen Staff authentication.",
    },
    {
      icon: <FiClock className="text-blue-600 text-xl" />,
      title: "Real-Time Operations",
      description: "Manage restaurant operations from a centralized dashboard.",
    },
    {
      icon: <FiUsers className="text-blue-600 text-xl" />,
      title: "Staff Management",
      description: "Control access and monitor restaurant staff efficiently.",
    },
  ];

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==========================
  // VALIDATION
  // ==========================

  const validateForm = () => {
    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================
  // LOGIN
  // ==========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (!result.success) {
      setErrors({
        email: result.message,
      });

      return;
    }

    navigate("/dashboard", {
      replace: true,
    });
  };
  // ==========================
  // UI
  // ==========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex">
      {/* ================= LEFT SIDE ================= */}

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />

        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-20 text-white w-full">
          <div className="mb-16">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg">
                🍽️
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-wide">
                  Restaurant ERP
                </h1>

                <p className="text-blue-100 mt-2">
                  Complete Restaurant Management System
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Manage your restaurant
            <br />
            smarter than ever.
          </h2>

          <p className="text-blue-100 text-lg leading-8 max-w-xl">
            A complete solution to manage POS, Inventory, Billing, Kitchen,
            Employees, CRM, Reports, Profit & Loss and everything your
            restaurant needs from one powerful dashboard.
          </p>

          <div className="mt-16 space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-5 items-start">
                <div className="bg-white rounded-xl p-3 text-blue-600 shadow-xl">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-xl">{feature.title}</h3>

                  <p className="text-blue-100 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="flex-1 flex justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-xl text-white text-4xl">
                🍽️
              </div>

              <h2 className="mt-6 text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>

              <p className="mt-2 text-gray-500">Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="mt-10 space-y-6">
              {/* Email */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>

                <div className="relative">
                  <FiMail className="absolute left-4 top-4 text-gray-400 text-lg" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-white outline-none transition-all ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              {/* Password */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-gray-400 text-lg" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-14 py-3 rounded-xl border bg-white outline-none transition-all ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
              </div>
              {/* Remember Me & Forgot Password */}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-600"
                  />
                  Remember Me
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity="0.25"
                      />
                      <path
                        d="M22 12a10 10 0 00-10-10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    Login
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}

            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                <FiCheckCircle />
                Secure Login
              </div>

              <p className="text-center text-gray-500 text-sm mt-4 leading-6">
                Restaurant ERP Management System
                <br />© {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
