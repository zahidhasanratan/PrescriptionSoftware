// src/Pages/Prescription/WritePrescription.jsx
import React, { useState } from "react";
import {
  UserPlus,
  Plus,
  Trash,
  FileText,
} from "lucide-react";

const existingPatients = [
  { id: 1, name: "John Doe", phone: "1234567890" },
  { id: 2, name: "Jane Smith", phone: "0987654321" },
  { id: 3, name: "Ali Hossain", phone: "01712345678" },
];

const PatientSelector = ({ selectedPatientId, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients only if searchTerm is not empty
  const filteredPatients =
    searchTerm.trim().length > 0
      ? existingPatients.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm)
        )
      : [];

  return (
    <div>
      <label className="block font-medium mb-1">Search Patient</label>
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="input input-bordered w-full mb-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm.trim().length > 0 && (
        <div className="border rounded max-h-48 overflow-y-auto bg-white shadow-sm">
          {filteredPatients.length === 0 ? (
            <p className="p-2 text-gray-500">No matching patients found</p>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => onSelectPatient(patient.id)}
                className={`block w-full text-left px-4 py-2 hover:bg-teal-100 transition
                  ${
                    selectedPatientId === patient.id
                      ? "bg-teal-200 font-semibold"
                      : ""
                  }`}
              >
                {patient.name} — {patient.phone}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const WritePrescription = () => {
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [medicines, setMedicines] = useState([]);

  const [medicineInput, setMedicineInput] = useState({
    name: "",
    dosage: "",
    duration: "",
  });

  const handleAddMedicine = () => {
    if (medicineInput.name && medicineInput.dosage) {
      setMedicines([...medicines, medicineInput]);
      setMedicineInput({ name: "", dosage: "", duration: "" });
    }
  };

  const handleRemoveMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-teal-800 flex items-center gap-2">
          <FileText size={24} />
          Write Prescription
        </h2>
        <button
          className="text-sm bg-teal-100 px-3 py-1 rounded-full font-medium text-teal-800 hover:bg-teal-200 transition"
          onClick={() => {
            setIsNewPatient(!isNewPatient);
            setSelectedPatientId(null);
          }}
        >
          {isNewPatient ? "Use Existing Patient" : "Add New Patient"}
        </button>
      </div>

      {/* Patient Form */}
      {isNewPatient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Patient Name</label>
            <input
              type="text"
              placeholder="Full Name"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Phone</label>
            <input
              type="text"
              placeholder="Phone Number"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Age</label>
            <input
              type="number"
              placeholder="Age"
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select className="select select-bordered w-full">
              <option disabled selected>
                Select
              </option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Date of Birth</label>
            <input type="date" className="input input-bordered w-full" />
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <PatientSelector
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        </div>
      )}

      {/* Core Prescription Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Complaints</label>
          <textarea className="textarea textarea-bordered w-full" rows={2} />
        </div>
        <div>
          <label className="block font-medium mb-1">Diagnosis</label>
          <textarea className="textarea textarea-bordered w-full" rows={2} />
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Advice / Instructions</label>
          <textarea className="textarea textarea-bordered w-full" rows={2} />
        </div>
      </div>

      {/* Add Medicines */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center gap-2">
          <UserPlus size={20} />
          Medicines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Medicine Name"
            value={medicineInput.name}
            onChange={(e) =>
              setMedicineInput({ ...medicineInput, name: e.target.value })
            }
          />
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Dosage (e.g. 1+0+1)"
            value={medicineInput.dosage}
            onChange={(e) =>
              setMedicineInput({ ...medicineInput, dosage: e.target.value })
            }
          />
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Duration (e.g. 5 days)"
            value={medicineInput.duration}
            onChange={(e) =>
              setMedicineInput({ ...medicineInput, duration: e.target.value })
            }
          />
        </div>
        <button
          className="mt-3 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
          onClick={handleAddMedicine}
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {/* List of Added Medicines */}
      {medicines.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3 text-gray-800">Added Medicines:</h4>
          <ul className="space-y-2">
            {medicines.map((med, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded shadow-sm border"
              >
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    Dosage: {med.dosage}, Duration: {med.duration}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition w-full">
        Submit Prescription
      </button>
    </div>
  );
};
