import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // if you use JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data, // unwrap response so you just get { data, message }
  (error) => {
    // axios.config.js (catch)
console.error('API Error:', {
  url: error?.config?.url,
  method: error?.config?.method,
  status: error?.response?.status,
  data: error?.response?.data
});

    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;
