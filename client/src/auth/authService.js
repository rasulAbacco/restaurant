// ==============================================
// src/auth/authService.js
// Restaurant ERP Authentication Service
// ==============================================

const STORAGE_KEYS = {
  USER: "restaurant_user",
  TOKEN: "restaurant_token",
};

// ==============================================
// DEMO USERS
// Remove after backend integration
// ==============================================

const DEMO_USERS = [
  {
    id: 1,
    name: "Restaurant Owner",
    email: "owner@restaurant.com",
    password: "123456",
    role: "OWNER",
    avatar: "",
  },
  {
    id: 2,
    name: "Restaurant Manager",
    email: "manager@restaurant.com",
    password: "123456",
    role: "MANAGER",
    avatar: "",
  },
  {
    id: 3,
    name: "POS Cashier",
    email: "cashier@restaurant.com",
    password: "123456",
    role: "CASHIER",
    avatar: "",
  },
  {
    id: 4,
    name: "Kitchen Staff",
    email: "kitchen@restaurant.com",
    password: "123456",
    role: "KITCHEN",
    avatar: "",
  },
];

// ==============================================
// LOGIN
// ==============================================

const login = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = DEMO_USERS.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const token = `restaurant_token_${Date.now()}`;

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);

  return {
    success: true,
    token,
    user,
  };
};

// ==============================================
// LOGOUT
// ==============================================

const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

// ==============================================
// CURRENT USER
// ==============================================

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
  } catch {
    return null;
  }
};

// ==============================================
// TOKEN
// ==============================================

const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// ==============================================
// AUTH CHECK
// ==============================================

const isAuthenticated = () => {
  return !!getToken();
};

// ==============================================
// ROLE
// ==============================================

const getRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// ==============================================
// UPDATE USER
// ==============================================

const updateUser = (data) => {
  const user = getCurrentUser();

  if (!user) return null;

  const updated = {
    ...user,
    ...data,
  };

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));

  return updated;
};

// ==============================================
// CHANGE PASSWORD
// Backend Later
// ==============================================

const changePassword = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    success: true,
    message: "Password changed successfully.",
  };
};

// ==============================================
// FORGOT PASSWORD
// Backend Later
// ==============================================

const forgotPassword = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    message: `Reset instructions sent to ${email}`,
  };
};

// ==============================================
// RESET PASSWORD
// Backend Later
// ==============================================

const resetPassword = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    message: "Password reset successfully.",
  };
};

// ==============================================
// REFRESH TOKEN
// Backend Later
// ==============================================

const refreshToken = async () => {
  const token = `restaurant_token_${Date.now()}`;

  localStorage.setItem(STORAGE_KEYS.TOKEN, token);

  return token;
};

// ==============================================
// AUTH HEADER
// ==============================================

const getAuthHeader = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// ==============================================
// CLEAR SESSION
// ==============================================

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

// ==============================================
// EXPORT
// ==============================================

const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  getRole,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  getAuthHeader,
  clearSession,
};

export default authService;
