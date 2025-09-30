import NavBar from "../components/NavBar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();

  const hideNav =
    location.pathname === "/signin" || location.pathname === "/signup";
  return (
    <>
      {!hideNav && <NavBar />}
      <Outlet />
    </>
  );
}
