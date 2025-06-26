// src/Pages/Prescription/Prescription.jsx
import React from "react";
import { FileText, PlusCircle, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const demoPrescriptions = [
  {
    id: 1,
    patientName: "John Doe",
    date: "2025-06-20",
    complaints: "Fever, cough, sore throat",
    diagnosis: "Common Cold",
    advice: "Rest, plenty of fluids",
    medicinesCount: 3,
  },
  {
    id: 2,
    patientName: "Jane Smith",
    date: "2025-06-18",
    complaints: "Headache, nausea",
    diagnosis: "Migraine",
    advice: "Avoid triggers, take medications",
    medicinesCount: 2,
  },
  {
    id: 3,
    patientName: "Ali Hossain",
    date: "2025-06-15",
    complaints: "Back pain",
    diagnosis: "Muscle strain",
    advice: "Physiotherapy, avoid heavy lifting",
    medicinesCount: 1,
  },
];

export const Prescription = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={26} className="text-teal-600" />
          <h2 className="text-2xl font-semibold text-teal-800">Prescriptions</h2>
        </div>
        <button
          onClick={() => navigate("/prescriptions/write")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <PlusCircle size={20} />
          <span className="font-medium">Write New</span>
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        Manage all prescriptions written by the doctor. Create, edit, and access patient prescriptions. Use features like medicine auto-suggestions, PDF generation, and previous prescription recall.
      </p>

      {/* Prescription Table */}
      {demoPrescriptions.length === 0 ? (
        <div className="mt-6 border border-dashed border-teal-400 p-6 rounded text-center text-teal-700 bg-teal-50">
          🕓 Prescription records will appear here soon.
        </div>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-teal-100 text-teal-900">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Patient Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Complaints</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Diagnosis</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Advice</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Medicines</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoPrescriptions.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-teal-50 transition cursor-pointer"
                onClick={() => alert(`Viewing prescription for ${p.patientName}`)}
              >
                <td className="border border-gray-300 px-4 py-2">{p.patientName}</td>
                <td className="border border-gray-300 px-4 py-2">{p.date}</td>
                <td className="border border-gray-300 px-4 py-2 truncate max-w-xs" title={p.complaints}>
                  {p.complaints}
                </td>
                <td className="border border-gray-300 px-4 py-2 truncate max-w-xs" title={p.diagnosis}>
                  {p.diagnosis}
                </td>
                <td className="border border-gray-300 px-4 py-2 truncate max-w-xs" title={p.advice}>
                  {p.advice}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{p.medicinesCount}</td>
                <td className="border border-gray-300 px-4 py-2 text-center flex justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`View prescription ${p.id} details`);
                    }}
                    title="View"
                    className="text-teal-600 hover:text-teal-800"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Edit prescription ${p.id}`);
                    }}
                    title="Edit"
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
