// src/Pages/Root/Root.jsx
import React, { useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarDrawer } from "../../Components/Sidebar/SidebarDrawer";
import { Header } from "../../Components/Header/Header";
import { Footer } from "../../Components/Footer/Footer";
import { AuthContext } from "../../Provider/AuthProvider";

export const Root = () => {
  const { user, logout } = useContext(AuthContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => setIsDrawerOpen((open) => !open);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-poppins text-gray-700 bg-gray-100">
      <SidebarDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} onLogout={handleLogout} onMenuClick={toggleDrawer} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
