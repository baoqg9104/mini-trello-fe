import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const isAuthHydrated = useSelector(
    (state: RootState) => state.auth.isAuthHydrated
  );
  if (!isAuthHydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};
