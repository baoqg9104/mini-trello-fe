import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import type { AuthState, JwtPayload } from "../types/auth";
import type { AppDispatch } from "./index";

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isAuthHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state: AuthState,
      action: PayloadAction<{ id: string; email: string; accessToken?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = { id: action.payload.id, email: action.payload.email };
      if (action.payload.accessToken) {
        localStorage.setItem("accessToken", action.payload.accessToken);
      }
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("accessToken");
    },
    setAuthHydrated: (state: AuthState) => {
      state.isAuthHydrated = true;
    },
  },
});

export const { login, logout, setAuthHydrated } = authSlice.actions;
export default authSlice.reducer;

export const hydrateAuth = () => (dispatch: AppDispatch) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken);
    if (decoded && decoded.id && decoded.email) {
      dispatch(login({ id: decoded.id, email: decoded.email, accessToken }));
    }
  }
  dispatch(setAuthHydrated());
};
