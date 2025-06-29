// eslint-disable-next-line
import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export const WritePrescription = () => {
  const [medicineInput, setMedicineInput] = useState({
    name: "",
    dosage: "",
    duration: "",
    type: "",
    strength: "",
    advice: ""
  });
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/medicines")
      .then((res) => setAllMedicines(res.data))
      .catch(() => Swal.fire("Error", "Failed to load medicines.", "error"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicineInput((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const filtered = allMedicines.filter((med) =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSelectSuggestion = (med) => {
    setMedicineInput({
      name: med.name,
      dosage: med.defaultDosage || "",
      duration: "",
      type: med.types[0] || "",
      strength: med.commonStrengths[0] || "",
      advice: med.usageAdvice || ""
    });
    setSuggestions([]);
  };

  const handleAddMedicine = () => {
    if (!medicineInput.name || !medicineInput.dosage) return;
    setMedicines((prev) => [...prev, medicineInput]);
    setMedicineInput({ name: "", dosage: "", duration: "", type: "", strength: "", advice: "" });
  };

  const handleRemoveMedicine = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-teal-800 flex items-center gap-2">
          <FileText size={24} /> Write Prescription
        </h2>
      </div>

      {/* Add Medicines */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end relative">
          <div className="col-span-1 md:col-span-2 relative">
            <input
              type="text"
              name="name"
              value={medicineInput.name}
              onChange={handleChange}
              placeholder="Medicine Name"
              className="input input-bordered w-full"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border w-full shadow-md rounded mt-1 max-h-40 overflow-y-auto">
                {suggestions.map((med) => (
                  <li
                    key={med._id}
                    className="px-4 py-2 hover:bg-teal-100 cursor-pointer"
                    onClick={() => handleSelectSuggestion(med)}
                  >
                    {med.name} ({med.types[0]}) - {med.commonStrengths[0] || ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {medicineInput.type === "Syrup" ? (
            <select
              name="dosage"
              value={medicineInput.dosage}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Spoon Amount</option>
              <option>1 spoon</option>
              <option>2 spoons</option>
              <option>1/2 spoon</option>
            </select>
          ) : medicineInput.type === "Injection" ? (
            <select
              name="dosage"
              value={medicineInput.dosage}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select Frequency</option>
              <option>Once</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          ) : (
            <input
              type="text"
              name="dosage"
              value={medicineInput.dosage}
              onChange={handleChange}
              placeholder="Dosage (e.g. 1+0+1)"
              className="input input-bordered w-full"
            />
          )}

          <input
            type="text"
            name="duration"
            value={medicineInput.duration}
            onChange={handleChange}
            placeholder="Duration (e.g. 5 days)"
            className="input input-bordered w-full"
          />
        </div>

        {medicineInput.advice && (
          <p className="text-sm text-gray-500 mt-1">Advice: {medicineInput.advice}</p>
        )}

        <button
          className="mt-3 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
          onClick={handleAddMedicine}
        >
          <Plus size={18} /> Add Medicine
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
                  <p className="font-medium">
                    {med.name} {med.type && `(${med.type})`} {med.strength && `- ${med.strength}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Dosage: {med.dosage}, Duration: {med.duration}, Advice: {med.advice}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition w-full">
        Submit Prescription
      </button>
    </div>
  );
};
