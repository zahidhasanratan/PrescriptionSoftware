import React, { useState } from "react";
import { Header } from "../../Components/Header/Header";
import { Outlet } from "react-router-dom";
import { Footer } from "../../Components/Footer/Footer";
import { SidebarDrawer } from "../../Components/Sidebar/SidebarDrawer";

export const Root = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toggle drawer open/close
  const toggleDrawer = () => setIsDrawerOpen(open => !open);

  // Close drawer (for overlay clicks or nav clicks)
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="flex h-screen overflow-hidden font-poppins text-gray-700 bg-gray-100">
      <SidebarDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={toggleDrawer} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
