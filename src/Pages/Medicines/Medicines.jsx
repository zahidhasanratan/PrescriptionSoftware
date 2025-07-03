// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import {
  Pill,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  X,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [newMed, setNewMed] = useState({
    name: "",
    types: "",
    commonStrengths: "",
    defaultDosage: "",
    usageAdvice: "",
  });

  const [editingMed, setEditingMed] = useState(null);

  const [suggestions, setSuggestions] = useState({
    types: ["Tablet", "Capsule", "Injection", "Syrup"],
    commonStrengths: ["500mg", "250mg", "1 spoon", "2 spoons", "1/2 spoon"],
    defaultDosage: ["1+0+1", "1+1+1", "0+1+0", "1+0+0"],
    usageAdvice: ["Before Meal", "After Meal", "With Water"],
  });

  const [showSuggestions, setShowSuggestions] = useState({});
  const [activeSuggestion, setActiveSuggestion] = useState({});

  axios.defaults.baseURL = "https://prescription-ebon.vercel.app/";

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines");
      setMedicines(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load medicines.", "error");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAdd = async () => {
    const payload = {
      name: newMed.name.trim(),
      types: newMed.types.split(",").map((t) => t.trim()),
      commonStrengths: newMed.commonStrengths.split(",").map((s) => s.trim()),
      defaultDosage: newMed.defaultDosage.trim(),
      usageAdvice: newMed.usageAdvice.trim(),
    };

    if (!payload.name || payload.types.length === 0 || payload.commonStrengths.length === 0) {
      return Swal.fire("Required", "Please fill in all required fields.", "warning");
    }

    try {
      await axios.post("/api/medicines", payload);
      setNewMed({ name: "", types: "", commonStrengths: "", defaultDosage: "", usageAdvice: "" });
      fetchMedicines();
      Swal.fire("Success", "Medicine added successfully!", "success");
    } catch (err) {
      console.error("Add Error →", err.response?.data || err.message);
      Swal.fire("Error", "Failed to add medicine.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "Are you sure you want to delete this medicine?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/api/medicines/${id}`);
        fetchMedicines();
        Swal.fire("Deleted!", "Medicine has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete medicine.", "error");
      }
    }
  };

  const handleEditClick = (medicine) => {
    setEditingMed({ ...medicine, types: medicine.types.join(", "), commonStrengths: medicine.commonStrengths.join(", ") });
  };

  const getSuggestions = (field, value) => {
    if (!value) return [];
    return suggestions[field].filter((item) => item.toLowerCase().includes(value.toLowerCase()));
  };

  const handleSuggestionClick = (key, value, target) => {
    target === "edit"
      ? setEditingMed((prev) => ({ ...prev, [key]: value }))
      : setNewMed((prev) => ({ ...prev, [key]: value }));
    setShowSuggestions((prev) => ({ ...prev, [key]: false }));
    setActiveSuggestion((prev) => ({ ...prev, [key]: -1 }));
  };

  const handleKeyDown = (e, key, target) => {
    const list = getSuggestions(key, target === "edit" ? editingMed[key] : newMed[key]);
    if (list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => ({ ...prev, [key]: Math.min((prev[key] ?? -1) + 1, list.length - 1) }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => ({ ...prev, [key]: Math.max((prev[key] ?? 0) - 1, 0) }));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = list[activeSuggestion[key] ?? -1];
      if (selected) {
        handleSuggestionClick(key, selected, target);
      }
    }
  };

  const saveEdit = async () => {
    const { _id, name, types, commonStrengths, defaultDosage, usageAdvice } = editingMed;
    if (!name.trim() || !types.trim() || !commonStrengths.trim()) {
      return Swal.fire("Required", "Please fill in all required fields.", "warning");
    }
    const payload = {
      name: name.trim(),
      types: types.split(",").map((t) => t.trim()),
      commonStrengths: commonStrengths.split(",").map((s) => s.trim()),
      defaultDosage: defaultDosage.trim(),
      usageAdvice: usageAdvice.trim(),
    };
    try {
      await axios.put(`/api/medicines/${_id}`, payload);
      setEditingMed(null);
      fetchMedicines();
      Swal.fire("Updated", "Medicine updated successfully!", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update medicine.", "error");
    }
  };

  const filtered = medicines.filter((med) => {
    const term = searchTerm.toLowerCase();
    return (
      med.name.toLowerCase().includes(term) ||
      med.types.join(", ").toLowerCase().includes(term) ||
      med.commonStrengths.join(", ").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Pill size={26} className="text-teal-600" />
          <h2 className="text-2xl font-semibold text-teal-800">Master Medicine List</h2>
        </div>
        <p className="text-sm text-gray-600">Total Medicines: {medicines.length}</p>
      </div>

      <div className="flex items-center gap-2 mb-4 max-w-sm">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search medicine..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Medicine Name"
          className="input input-bordered w-full"
          value={newMed.name}
          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
        />

        {["types", "commonStrengths", "defaultDosage", "usageAdvice"].map((key) => (
          <div key={key} className="relative">
            <input
              type="text"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
              className="input input-bordered w-full"
              value={newMed[key]}
              onChange={(e) => {
                setNewMed({ ...newMed, [key]: e.target.value });
                setShowSuggestions((prev) => ({ ...prev, [key]: true }));
              }}
              onKeyDown={(e) => handleKeyDown(e, key, "add")}
              onBlur={() => setTimeout(() => setShowSuggestions((prev) => ({ ...prev, [key]: false })), 200)}
              onFocus={() => setShowSuggestions((prev) => ({ ...prev, [key]: true }))}
            />
            {showSuggestions[key] && getSuggestions(key, newMed[key]).length > 0 && (
              <ul className="absolute z-10 bg-white border rounded w-full max-h-36 overflow-auto mt-1">
                {getSuggestions(key, newMed[key]).map((sugg, idx) => (
                  <li
                    key={sugg}
                    className={`px-3 py-1 cursor-pointer ${activeSuggestion[key] === idx ? "bg-teal-100" : "hover:bg-teal-50"}`}
                    onMouseDown={() => handleSuggestionClick(key, sugg)}
                  >
                    {sugg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="md:col-span-3 mt-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      {currentItems.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="bg-teal-100 text-teal-900">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Types</th>
                <th className="border px-4 py-2 text-left">Strengths</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((med) => (
                <tr key={med._id} className="hover:bg-teal-50">
                  <td className="border px-4 py-2">{med.name}</td>
                  <td className="border px-4 py-2">{med.types.join(", ")}</td>
                  <td className="border px-4 py-2">{med.commonStrengths.join(", ")}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEditClick(med)}
                      className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                className="btn btn-sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {editingMed && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={() => setEditingMed(null)}
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>
            {["name", "types", "commonStrengths", "defaultDosage", "usageAdvice"].map((key) => (
              <div key={key} className="relative mb-3">
                <input
                  type="text"
                  placeholder={key}
                  className="input input-bordered w-full"
                  value={editingMed[key] || ""}
                  onChange={(e) => {
                    setEditingMed({ ...editingMed, [key]: e.target.value });
                    setShowSuggestions((prev) => ({ ...prev, [key]: true }));
                  }}
                  onKeyDown={(e) => handleKeyDown(e, key, "edit")}
                  onBlur={() => setTimeout(() => setShowSuggestions((prev) => ({ ...prev, [key]: false })), 200)}
                  onFocus={() => setShowSuggestions((prev) => ({ ...prev, [key]: true }))}
                />
                {showSuggestions[key] && getSuggestions(key, editingMed[key]).length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded w-full max-h-36 overflow-auto mt-1">
                    {getSuggestions(key, editingMed[key]).map((sugg, idx) => (
                      <li
                        key={sugg}
                        className={`px-3 py-1 cursor-pointer ${activeSuggestion[key] === idx ? "bg-teal-100" : "hover:bg-teal-50"}`}
                        onMouseDown={() => handleSuggestionClick(key, sugg, "edit")}
                      >
                        {sugg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <button
              onClick={saveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
