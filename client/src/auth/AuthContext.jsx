import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ==========================================
// AUTH CONTEXT
// ==========================================

const AuthContext = createContext(null);

// ==========================================
// ROLES
// ==========================================

export const ROLES = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  KITCHEN: "KITCHEN",
};

// ==========================================
// STORAGE KEYS
// ==========================================

const STORAGE_KEYS = {
  USER: "restaurant_user",
  TOKEN: "restaurant_token",
};

// ==========================================
// DEMO USERS
// Remove after backend integration
// ==========================================

const DEMO_USERS = [
  {
    id: 1,
    name: "Restaurant Owner",
    email: "owner@restaurant.com",
    password: "123456",
    role: ROLES.OWNER,
    avatar: "",
  },
  {
    id: 2,
    name: "Restaurant Manager",
    email: "manager@restaurant.com",
    password: "123456",
    role: ROLES.MANAGER,
    avatar: "",
  },
  {
    id: 3,
    name: "POS Cashier",
    email: "cashier@restaurant.com",
    password: "123456",
    role: ROLES.CASHIER,
    avatar: "",
  },
  {
    id: 4,
    name: "Kitchen Staff",
    email: "kitchen@restaurant.com",
    password: "123456",
    role: ROLES.KITCHEN,
    avatar: "",
  },
];

// ==========================================
// PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ==========================================
  // LOAD SESSION
  // ==========================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));

        setToken(storedToken);

        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error(error);

      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    setLoading(true);

    try {
      // Backend Integration Here

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      const fakeToken = "restaurant_demo_token_" + Date.now();

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));

      localStorage.setItem(STORAGE_KEYS.TOKEN, fakeToken);

      setUser(foundUser);

      setToken(fakeToken);

      setIsAuthenticated(true);

      return {
        success: true,

        user: foundUser,
      };
    } catch (error) {
      return {
        success: false,

        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  };
  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Later:
    // navigate("/login");
  };

  // ==========================================
  // UPDATE USER
  // ==========================================

  const updateUser = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
    };

    setUser(updatedUser);

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // ==========================================
  // CHANGE PASSWORD
  // (Backend Later)
  // ==========================================

  const changePassword = async (currentPassword, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "Password updated successfully.",
    };
  };

  // ==========================================
  // ROLE HELPERS
  // ==========================================

  const hasRole = (roles = []) => {
    if (!user) return false;

    return roles.includes(user.role);
  };

  const isOwner = () => user?.role === ROLES.OWNER;

  const isManager = () => user?.role === ROLES.MANAGER;

  const isCashier = () => user?.role === ROLES.CASHIER;

  const isKitchen = () => user?.role === ROLES.KITCHEN;

  // ==========================================
  // PERMISSION HELPERS
  // ==========================================

  const canManageUsers = () => isOwner();

  const canManageSettings = () => isOwner();

  const canViewReports = () => isOwner() || isManager();

  const canAccessPOS = () => isOwner() || isManager() || isCashier();

  const canAccessKitchen = () => isOwner() || isManager() || isKitchen();

  const canManageInventory = () => isOwner() || isManager();

  const canViewProfit = () => isOwner();

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = useMemo(
    () => ({
      user,

      token,

      loading,

      isAuthenticated,

      login,

      logout,

      updateUser,

      changePassword,

      hasRole,

      isOwner,

      isManager,

      isCashier,

      isKitchen,

      canManageUsers,

      canManageSettings,

      canViewReports,

      canAccessPOS,

      canAccessKitchen,

      canManageInventory,

      canViewProfit,
    }),
    [user, token, loading, isAuthenticated],
  );
  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

// ==========================================
// EXPORT
// ==========================================

export default AuthContext;
