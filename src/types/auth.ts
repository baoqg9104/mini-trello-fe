export interface JwtPayload {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string };
  isAuthHydrated: boolean;
}

export interface User {
  id: string;
  email: string;
}
