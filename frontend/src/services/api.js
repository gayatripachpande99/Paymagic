const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running locally in browser (localhost / 127.0.0.1), route to local backend
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }
  return "https://paymagic.onrender.com/api";
};

const API_URL = getApiBaseUrl();

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = localStorage.getItem(
    "paymagic_token"
  );

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status} (${response.statusText}).`);
    }
    throw new Error("Invalid response format received from server.");
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

export const api = {
  get: (endpoint) =>
    apiRequest(endpoint, {
      method: "GET"
    }),

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    })
};

export default api;
