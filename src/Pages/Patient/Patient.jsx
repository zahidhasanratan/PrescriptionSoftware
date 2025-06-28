import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

export const Patient = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPatients(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      setCurrentPage(1);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = patients.filter((p) =>
      p.name?.toLowerCase().includes(lowerTerm) ||
      p.patientId?.toLowerCase().includes(lowerTerm) ||
      p.phone?.toLowerCase().includes(lowerTerm) ||
      p.gender?.toLowerCase().includes(lowerTerm) ||
      p.age?.toString().includes(lowerTerm)
    );

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patients]);

  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + PAGE_SIZE);

  const handleDelete = async (patientId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this patient? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete patient");

      setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
      setFilteredPatients((prev) => prev.filter((p) => p.patientId !== patientId));

      Swal.fire("Deleted!", "Patient has been deleted.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to delete patient", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-3xl font-extrabold text-teal-900">Patients</h2>
          <span className="text-sm text-gray-500">Total: {patients.length}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <input
              type="search"
              placeholder="Search by name, ID, phone, gender, age..."
              className="input input-bordered w-full pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button
            onClick={() => navigate("/add-patient")}
            className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading patients...</p>
        ) : error ? (
          <p className="p-8 text-center text-red-500">Error: {error}</p>
        ) : filteredPatients.length === 0 ? (
          <p className="p-8 text-center text-gray-600">No patients found.</p>
        ) : (
          <table className="table table-zebra w-full text-sm">
            <thead className="bg-teal-100 text-teal-900">
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPatients.map((p) => (
                <tr key={p._id}>
                  <td className="font-mono">{p.patientId}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td className="flex justify-center gap-2">
                    <button
                      className="btn btn-xs btn-info btn-outline"
                      onClick={() => navigate(`/patient/${p.patientId}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-xs btn-warning btn-outline"
                      onClick={() => navigate(`/edit-patient/${p.patientId}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-xs btn-error btn-outline"
                      onClick={() => handleDelete(p.patientId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredPatients.length > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="btn btn-circle btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            aria-label="Previous Page"
          >
            <ChevronLeft />
          </button>
          <span className="font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-circle btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            aria-label="Next Page"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};
