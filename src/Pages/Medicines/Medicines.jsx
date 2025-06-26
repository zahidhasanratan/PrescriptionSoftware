import React, { useState } from "react";
import { Pill, Plus, Trash2, Edit, Search } from "lucide-react";

export const Medicines = () => {
  const [medicines, setMedicines] = useState([
    { id: 1, name: "Paracetamol", type: "Tablet", strength: "500mg" },
    { id: 2, name: "Amoxicillin", type: "Capsule", strength: "250mg" },
    { id: 3, name: "Loratadine", type: "Tablet", strength: "10mg" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMed, setNewMed] = useState({ name: "", type: "", strength: "" });

  const filtered = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newMed.name || !newMed.type || !newMed.strength) return;
    setMedicines([
      ...medicines,
      { ...newMed, id: Date.now() }
    ]);
    setNewMed({ name: "", type: "", strength: "" });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Pill size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">Master Medicine List</h2>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        Manage your full list of medicines. Add, update, or remove entries to maintain a clean master list for prescription writing.
      </p>

      {/* Search */}
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

      {/* Add Form */}
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
          placeholder="Type (e.g. Tablet)"
          className="input input-bordered w-full"
          value={newMed.type}
          onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
        />
        <input
          type="text"
          placeholder="Strength (e.g. 500mg)"
          className="input input-bordered w-full"
          value={newMed.strength}
          onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="md:col-span-3 mt-2 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-teal-100 text-teal-900">
            <tr>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Strength</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((med) => (
                <tr key={med.id} className="hover:bg-teal-50">
                  <td className="border px-4 py-2">{med.name}</td>
                  <td className="border px-4 py-2">{med.type}</td>
                  <td className="border px-4 py-2">{med.strength}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      title="Edit (coming soon)"
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
