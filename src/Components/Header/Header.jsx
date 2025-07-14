// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";

export const Header = ({ onMenuClick, onLogout, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const displayName = user?.displayName || "Guest User";
  const DEFAULT_AVATAR =
    "https://img.freepik.com/premium-vector/avatar-bearded-doctor-doctor-with-stethoscope-vector-illustrationxa_276184-31.jpg";
  // if user.photoURL exists use it, otherwise fall back to our doctor avatar
  const photoURL = user?.photoURL ? user.photoURL : DEFAULT_AVATAR;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white shadow-md border-b">
      {/* Mobile menu button */}
      <button
        onClick={e => { e.stopPropagation(); onMenuClick(); }}
        className="md:hidden text-teal-600 hover:text-teal-700 transition"
        aria-label="Open Menu"
        data-menu-button
      >
        <Menu size={28} />
      </button>

      {/* App title */}
      <h1 className="text-xl font-bold text-teal-900">Smart Prescription</h1>

      {/* Profile section with dropdown */}
      <div
        ref={dropdownRef}
        className="relative flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setDropdownOpen(open => !open)}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <div className="text-sm text-right max-w-[140px] truncate">
          <p className="font-semibold truncate">{displayName}</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-teal-600 flex-shrink-0">
          <img
            src={photoURL}
            alt={`${displayName}'s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        <ChevronDown size={20} className="text-gray-500" />

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <button
              onClick={e => {
                e.stopPropagation();
                setDropdownOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-red-100 hover:text-red-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
