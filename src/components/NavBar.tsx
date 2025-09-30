import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { logout } from "../store/authSlice";

export default function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <div className="flex items-center gap-2">
        <img src="/trello-icon.png" alt="Logo" className="size-8" />
        <span className="font-bold text-xl text-blue-700">MiniTrello</span>
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-2 focus:outline-none"
          onClick={() => setShowDropdown((v) => !v)}
        >
          <div className="size-10 text-xl rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-70 bg-white border rounded-xl shadow-lg z-10 py-2 px-4 flex flex-col gap-2 min-w-[200px]">
            <div className="flex flex-col items-start gap-1 py-2 border-b">
              <span className="text-xs text-gray-400">Signed in as</span>
              <span className="font-semibold text-gray-700 break-all">
                {user?.email}
              </span>
            </div>
            <button
              className="w-full mt-1 py-2 px-3 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
