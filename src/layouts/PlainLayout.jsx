// src/layouts/PlainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export const PlainLayout = () => {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};
