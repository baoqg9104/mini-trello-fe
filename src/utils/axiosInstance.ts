import axios from "axios";
import { jwtDecode } from "jwt-decode";
import store from "../store";
import { logout } from "../store/authSlice";

const instance = axios.create({
  baseURL: "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token) as { exp?: number };

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        store.dispatch(logout());
        return Promise.reject(new Error("Token expired"));
      }

      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
