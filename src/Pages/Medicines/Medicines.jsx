// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import { Pill, Plus, Trash2, Search, ChevronLeft, ChevronRight, Edit, X } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMed, setNewMed] = useState({ name: "", types: "", commonStrengths: "" });
  const [editingMed, setEditingMed] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  axios.defaults.baseURL = "http://localhost:5000";

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
      commonDosages: [],
      commonAdvices: [],
    };

    if (!payload.name || payload.types.length === 0 || payload.commonStrengths.length === 0) {
      return Swal.fire("Required", "Please fill in all required fields.", "warning");
    }

    try {
      await axios.post("/api/medicines", payload);
      setNewMed({ name: "", types: "", commonStrengths: "" });
      fetchMedicines();
      Swal.fire("Success", "Medicine added successfully!", "success");
    } catch (err) {
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

  const handleEditClick = (med) => {
    setEditingMed({ ...med, types: med.types.join(", "), commonStrengths: med.commonStrengths.join(", ") });
  };

  const saveEdit = async () => {
    const { _id, name, types, commonStrengths } = editingMed;
    if (!name.trim() || !types.trim() || !commonStrengths.trim()) {
      return Swal.fire("Required", "Please fill in all fields.", "warning");
    }
    const payload = {
      name: name.trim(),
      types: types.split(",").map((t) => t.trim()),
      commonStrengths: commonStrengths.split(",").map((s) => s.trim()),
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
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
        <input
          type="text"
          placeholder="Types (comma-separated)"
          className="input input-bordered w-full"
          value={newMed.types}
          onChange={(e) => setNewMed({ ...newMed, types: e.target.value })}
        />
        <input
          type="text"
          placeholder="Strengths (comma-separated)"
          className="input input-bordered w-full"
          value={newMed.commonStrengths}
          onChange={(e) => setNewMed({ ...newMed, commonStrengths: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="md:col-span-3 mt-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </div>

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
                <td className="border px-4 py-2">{med.types?.join(", ")}</td>
                <td className="border px-4 py-2">{med.commonStrengths?.join(", ")}</td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => handleEditClick(med)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(med._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Edit Modal */}
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
            <input
              type="text"
              className="input input-bordered w-full mb-3"
              value={editingMed.name}
              onChange={(e) => setEditingMed({ ...editingMed, name: e.target.value })}
            />
            <input
              type="text"
              className="input input-bordered w-full mb-3"
              value={editingMed.types}
              onChange={(e) => setEditingMed({ ...editingMed, types: e.target.value })}
            />
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={editingMed.commonStrengths}
              onChange={(e) => setEditingMed({ ...editingMed, commonStrengths: e.target.value })}
            />
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
