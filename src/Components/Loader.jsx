import React from "react";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-green-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-white"></div>
      </div>
    </div>
  );
};
