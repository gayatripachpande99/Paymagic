import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("paymagic_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("paymagic_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem("paymagic_token");
      if (storedToken) {
        try {
          const res = await api.get("/auth/me");
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("paymagic_user", JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn("Auth token check failed:", err.message);
          // If token fails, clear credentials
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.success && res.tokens && res.user) {
      localStorage.setItem("paymagic_token", res.tokens.accessToken);
      localStorage.setItem("paymagic_refresh_token", res.tokens.refreshToken);
      localStorage.setItem("paymagic_user", JSON.stringify(res.user));
      setToken(res.tokens.accessToken);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || "Login failed");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("paymagic_token");
      localStorage.removeItem("paymagic_refresh_token");
      localStorage.removeItem("paymagic_user");
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (...allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const getPortalRouteForRole = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "/portal/super-admin";
      case "ADMIN":
        return "/portal/admin";
      case "SUPERVISOR":
        return "/portal/supervisor";
      case "CALLER":
        return "/portal/caller";
      case "FIELD_AGENT":
        return "/portal/field-agent";
      default:
        return "/portal/caller";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        hasRole,
        getPortalRouteForRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

