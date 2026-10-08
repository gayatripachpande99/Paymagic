const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://paymagic.onrender.com/api";

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
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
