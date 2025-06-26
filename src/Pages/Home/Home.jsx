// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, FileText, ClipboardList, History, Settings } from "lucide-react";

export const Home = () => {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-teal-800">Welcome back, Dr. A. Karim</h1>
        <p className="text-gray-600 mt-1">Here’s a quick overview of your clinic today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: 1320 },
          { label: "Active Prescriptions", value: 43 },
          { label: "Pending Reports", value: 12 },
          { label: "Recent Visits", value: 5 },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white shadow-sm rounded-lg p-4 border hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold text-teal-700">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/patients/new"
          className="bg-teal-500 hover:bg-teal-600 text-white p-5 rounded-lg flex items-center gap-4 transition"
        >
          <UserPlus />
          <span className="font-medium">Add New Patient</span>
        </Link>
        <Link
          to="/prescriptions/write"
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-5 rounded-lg flex items-center gap-4 transition"
        >
          <ClipboardList />
          <span className="font-medium">Write New Prescription</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Recent Prescriptions</h2>
        <div className="bg-white border rounded-lg divide-y">
          {["Mokbul Hossain", "Fatema Akter", "Rafiq Islam"].map((name, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 flex justify-between">
              <div>
                <p className="font-medium text-gray-800">{name}</p>
                <p className="text-sm text-gray-500">Last visit: 2025-06-25</p>
              </div>
              <Link
                to={`/prescriptions/view/${idx}`}
                className="text-sm text-teal-600 hover:underline"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
        <Link
          to="/patients"
          className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow"
        >
          <UserPlus className="text-teal-600 mb-2" />
          <span className="text-sm font-medium">Manage Patients</span>
        </Link>
        <Link
          to="/reports"
          className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow"
        >
          <FileText className="text-indigo-600 mb-2" />
          <span className="text-sm font-medium">Reports</span>
        </Link>
        <Link
          to="/history"
          className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow"
        >
          <History className="text-yellow-600 mb-2" />
          <span className="text-sm font-medium">History</span>
        </Link>
        <Link
          to="/settings"
          className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow"
        >
          <Settings className="text-gray-600 mb-2" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
};
