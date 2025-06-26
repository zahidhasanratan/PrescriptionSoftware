// src/Pages/History/ViewPrescription.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { FileText, CalendarDays, User } from "lucide-react";

export const ViewPrescription = () => {
  const { id } = useParams();

  // Dummy data to simulate a prescription fetch by ID
  const prescription = {
    id,
    patient: {
      name: "John Doe",
      age: 32,
      gender: "Male",
      phone: "01712345678",
      dob: "1992-04-12",
    },
    date: "2025-06-26",
    complaints: "Fever, Cough, Body Pain",
    diagnosis: "Seasonal Flu",
    advice: "Drink warm fluids, take rest, monitor temperature regularly.",
    medicines: [
      { name: "Paracetamol", dosage: "1+1+1", duration: "5 days" },
      { name: "Cetrizine", dosage: "0+0+1", duration: "3 days" },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-teal-600" />
          <h2 className="text-2xl font-semibold text-teal-800">
            Prescription Details
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays size={16} />
          <span>{prescription.date}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-6 border p-4 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <User size={18} className="text-teal-600" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Name:</strong> {prescription.patient.name}</p>
          <p><strong>Phone:</strong> {prescription.patient.phone}</p>
          <p><strong>Age:</strong> {prescription.patient.age}</p>
          <p><strong>Gender:</strong> {prescription.patient.gender}</p>
          <p><strong>Date of Birth:</strong> {prescription.patient.dob}</p>
        </div>
      </div>

      {/* Layout Split: Complaints / Diagnosis / Advice and Medicines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-teal-700 mb-1">
              Complaints
            </h4>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md border">
              {prescription.complaints}
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-teal-700 mb-1">
              Diagnosis
            </h4>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md border">
              {prescription.diagnosis}
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-teal-700 mb-1">
              Advice / Instructions
            </h4>
            <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md border">
              {prescription.advice}
            </p>
          </div>
        </div>

        {/* Right Column - Medicines */}
        <div>
          <h4 className="text-md font-semibold text-teal-700 mb-3">
            Medicines
          </h4>
          <ul className="space-y-2">
            {prescription.medicines.map((med, idx) => (
              <li
                key={idx}
                className="bg-white border p-3 rounded-md shadow-sm text-sm"
              >
                <p className="font-semibold text-teal-800">{med.name}</p>
                <p className="text-gray-700">
                  Dosage: <span className="font-medium">{med.dosage}</span>, Duration:{" "}
                  <span className="font-medium">{med.duration}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
