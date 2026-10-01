import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://10.10.7.94:5002/api/v1";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the access token to the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (like 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens and session cookie
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userInfo");
        document.cookie = "aya_client_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        const currentPath = window.location.pathname;
        const isProtectedPath =
          currentPath === "/profile" ||
          currentPath.startsWith("/bookings") ||
          currentPath.startsWith("/messages") ||
          currentPath.startsWith("/notifications") ||
          currentPath.includes("/book");

        if (isProtectedPath) {
          window.location.href = `/client/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
