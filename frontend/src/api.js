import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors and session management
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("login")) {
        // Optionally redirect to login (commented out to avoid redirect loops)
        // window.location.href = "/student-login";
      }
    }
    
    // Return error to be handled by the calling code
    return Promise.reject(error);
  }
);

export default api;
