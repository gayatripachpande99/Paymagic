const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }
  return "/api";
};

export const API_URL = getApiBaseUrl();

// Single-flight promise lock to prevent refresh race conditions on concurrent 401s
let refreshPromise = null;

const handleSessionExpired = () => {
  try {
    localStorage.removeItem("paymagic_token");
    localStorage.removeItem("paymagic_refresh_token");
    localStorage.removeItem("paymagic_user");
  } catch (e) {
    // Ignore localStorage access issues
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("paymagic:session_expired"));
    // Smoothly redirect to login with expired indicator if not already on /login
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login?session_expired=true";
    }
  }
};

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("paymagic_refresh_token");
  if (!refreshToken) {
    handleSessionExpired();
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        handleSessionExpired();
        return null;
      }

      const data = await response.json();
      if (data.success && data.tokens?.accessToken) {
        localStorage.setItem("paymagic_token", data.tokens.accessToken);
        if (data.tokens.refreshToken) {
          localStorage.setItem("paymagic_refresh_token", data.tokens.refreshToken);
        }
        return data.tokens.accessToken;
      } else {
        handleSessionExpired();
        return null;
      }
    } catch (err) {
      handleSessionExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("paymagic_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Check for 401 Unauthorized (attempt atomic token refresh)
    if (
      response.status === 401 &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/refresh")
    ) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`
        };
        const retryRes = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders
        });
        const retryText = await retryRes.text();
        let retryData;
        try {
          retryData = retryText ? JSON.parse(retryText) : {};
        } catch {
          return {};
        }
        if (!retryRes.ok) {
          throw new Error(retryData.message || `API request failed with status ${retryRes.status}`);
        }
        return retryData;
      } else {
        throw new Error("Your session has expired. Please log in again.");
      }
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }
      return {};
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
  post: (endpoint, body) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) => apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" })
};

export default api;
