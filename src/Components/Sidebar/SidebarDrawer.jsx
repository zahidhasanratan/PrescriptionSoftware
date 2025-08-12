// src/Components/Sidebar/SidebarDrawer.jsx
import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  History,
  Settings,
  Settings2,
  HelpCircle,
  Package,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Patients", icon: Users, path: "/patients" },
  { label: "Prescriptions", icon: ClipboardList, path: "/prescriptions" },
  { label: "Reports", icon: FileText, path: "/reports" },
  { label: "History", icon: History, path: "/history" },
  { label: "Master Medicines", icon: Package, path: "/medicines" },
  { label: "Complaints Settings", icon: Settings2, path: "/complaints" },
  { label: "Settings", icon: Settings, path: "/settings" },
  { label: "Help / Support", icon: HelpCircle, path: "/help" },
];

export const SidebarDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname, isOpen, onClose]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        !e.target.closest("[data-menu-button]")
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      ></div>

      {/* Sidebar Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 shadow-md transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-teal-800">Doctor Panel</h2>
          <button
            className="md:hidden text-teal-600 hover:text-teal-800"
            onClick={onClose}
            aria-label="Close Menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="p-5 space-y-2 font-poppins">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-4 px-4 py-2 rounded-md transition text-sm font-medium
                ${
                  location.pathname === path
                    ? "bg-teal-500 text-white shadow"
                    : "text-gray-700 hover:bg-teal-100 hover:text-teal-700"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};
