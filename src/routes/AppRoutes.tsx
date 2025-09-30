import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Home } from "../pages/Home";
import BoardDetailPage from "../pages/BoardDetailPage";
import { SignIn } from "../pages/SignIn";
import { SignUp } from "../pages/SignUp";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import InviteConfirmPage from "../pages/InviteConfirmPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/boards/:id" element={<BoardDetailPage />} />
        </Route>
        <Route path="/invite/confirm" element={<InviteConfirmPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};
