import axios from "axios";

export const api = axios.create({
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    (
      config.headers as Record<string, string>
    ).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize axios default header from stored token on app start
const bootToken = localStorage.getItem("access_token");
if (bootToken) {
  api.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}
