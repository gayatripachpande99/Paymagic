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

    // Check for 401 Unauthorized (attempt refresh)
    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const refreshToken = localStorage.getItem("paymagic_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.tokens) {
            localStorage.setItem("paymagic_token", refreshData.tokens.accessToken);
            localStorage.setItem("paymagic_refresh_token", refreshData.tokens.refreshToken);
            headers.Authorization = `Bearer ${refreshData.tokens.accessToken}`;
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers
            });
            return await retryRes.json();
          }
        } catch (refreshErr) {
          localStorage.removeItem("paymagic_token");
          localStorage.removeItem("paymagic_refresh_token");
          localStorage.removeItem("paymagic_user");
          window.location.href = "/login";
        }
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
