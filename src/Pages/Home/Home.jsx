// --- src/pages/Home.jsx ---
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  FileText,
  ClipboardList,
  History,
  Settings,
  Upload,
  Plus,
} from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const Home = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePrescriptions: 0,
    totalMedicines: 0,
    todaysVisits: 0,
  });

  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [chartData7Days, setChartData7Days] = useState([]);
  const [chartData30Days, setChartData30Days] = useState([]);
  const [selectedTab, setSelectedTab] = useState("7");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patientsRes, prescriptionsRes, medicinesRes] = await Promise.all([
          axios.get("https://prescription-ebon.vercel.app/api/patients"),
          axios.get("https://prescription-ebon.vercel.app/api/prescriptions"),
          axios.get("https://prescription-ebon.vercel.app/api/medicines"),
        ]);

        const prescriptions = prescriptionsRes.data;

        // Last 7 Days Chart
        const last7 = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split("T")[0];
          const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          const daily = prescriptions.filter(p =>
            new Date(p.createdAt).toISOString().startsWith(dateStr)
          );

          return { name: label, prescriptions: daily.length, visits: daily.length };
        });

        // Last 30 Days Chart
        const last30 = [...Array(30)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateStr = date.toISOString().split("T")[0];
          const label = date.toLocaleDateString("en-US", { day: "numeric" });

          const daily = prescriptions.filter(p =>
            new Date(p.createdAt).toISOString().startsWith(dateStr)
          );

          return { name: label, prescriptions: daily.length, visits: daily.length };
        });

        setStats({
          totalPatients: patientsRes.data.length,
          activePrescriptions: prescriptions.length,
          totalMedicines: medicinesRes.data.length,
          todaysVisits: last7[6].visits,
        });

        setChartData7Days(last7);
        setChartData30Days(last30);

        const sortedRecent = prescriptions
          .slice(-3)
          .reverse()
          .map(p => ({
            name: p.patient?.name || "Unknown",
            visit_date: new Date(p.createdAt).toLocaleDateString(),
            id: p._id,
          }));

        setRecentPrescriptions(sortedRecent);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  const chartData = selectedTab === "7" ? chartData7Days : chartData30Days;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-800">Welcome back, Prof. Dr. Md. Anwarul Karim</h1>
        <p className="text-gray-600 mt-1">Here’s a quick overview of your clinic today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: stats.totalPatients },
          { label: "Active Prescriptions", value: stats.activePrescriptions },
          { label: "Total Medicines", value: stats.totalMedicines },
          { label: "Today's Visits", value: stats.todaysVisits },
        ].map(item => (
          <div key={item.label} className="bg-white shadow rounded-lg p-4 border">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold text-teal-700">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Performance Chart with Tabs */}
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-teal-700">Performance</h3>
          <div className="tabs">
            <button
              onClick={() => setSelectedTab("7")}
              className={`btn btn-sm ${selectedTab === "7" ? "btn-primary" : "btn-ghost"}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedTab("30")}
              className={`btn btn-sm ${selectedTab === "30" ? "btn-primary" : "btn-ghost"}`}
            >
              Last 1 Month
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />
            <Line type="monotone" dataKey="prescriptions" stroke="#0d9488" name="Prescriptions" />
            <Line type="monotone" dataKey="visits" stroke="#6366f1" name="Visits" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/add-patient" className="btn btn-primary flex gap-3 justify-center">
          <UserPlus size={18} /> Add New Patient
        </Link>
        <Link to="/prescriptions/write" className="btn btn-secondary flex gap-3 justify-center">
          <ClipboardList size={18} /> Write New Prescription
        </Link>
        <Link to="/medicines" className="btn bg-pink-500 hover:bg-pink-600 text-white flex gap-3 justify-center">
          <Plus size={18} /> Add Medicine
        </Link>
        <Link to="/reports" className="btn bg-orange-500 hover:bg-orange-600 text-white flex gap-3 justify-center">
          <Upload size={18} /> Upload Report
        </Link>
      </div>

      {/* Recent Prescriptions */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Recent Prescriptions</h2>
        <div className="bg-white border rounded-lg divide-y">
          {recentPrescriptions.length > 0 ? recentPrescriptions.map(p => (
            <div key={p.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{p.name}</p>
                <p className="text-sm text-gray-500">Last visit: {p.visit_date}</p>
              </div>
              <Link
                to={`/prescriptions/${p.id}`}
                className="text-sm text-teal-600 hover:underline"
              >
                View
              </Link>
            </div>
          )) : (
            <p className="p-4 text-gray-500">No recent prescriptions.</p>
          )}
        </div>
      </div>

     

      {/* Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
        <Link to="/patients" className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow">
          <UserPlus className="text-teal-600 mb-2" />
          <span className="text-sm font-medium">Manage Patients</span>
        </Link>
        <Link to="/reports" className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow">
          <FileText className="text-indigo-600 mb-2" />
          <span className="text-sm font-medium">Reports</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow">
          <History className="text-yellow-600 mb-2" />
          <span className="text-sm font-medium">History</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center bg-white p-4 rounded-lg border hover:shadow">
          <Settings className="text-gray-600 mb-2" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
       {/* Last Login */}
      <div className="text-sm text-gray-600">
        <p><strong>Last Login:</strong> June 29, 2025 at 9:42 PM from IP: 192.168.1.2</p>
      </div>
    </div>
  );
};
