// src/Pages/Patients/Patient.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  PenSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

export const Patient = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://prescription-ebon.vercel.app/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const list = patients.filter((p) => {
      const txt = [p.name, p.patientId, p.phone, p.gender, p.age?.toString()]
        .join(" ")
        .toLowerCase();
      const matchesSearch = txt.includes(lower);

      const d = new Date(p.createdAt).setHours(0, 0, 0, 0);
      const inFrom = dateFrom
        ? d >= new Date(dateFrom).setHours(0, 0, 0, 0)
        : true;
      const inTo = dateTo
        ? d <= new Date(dateTo).setHours(23, 59, 59, 999)
        : true;

      return matchesSearch && inFrom && inTo;
    });

    setFilteredPatients(list);
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, patients]);

  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE) || 1;
  const start = (currentPage - 1) * PAGE_SIZE;
  const current = filteredPatients.slice(start, start + PAGE_SIZE);

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

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
      const res = await fetch(
        `https://prescription-ebon.vercel.app/api/patients/${patientId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete patient");

      setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
      Swal.fire("Deleted!", "Patient has been deleted.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to delete patient", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-3xl font-extrabold text-teal-900">Patients</h2>
          <span className="text-sm text-gray-500">
            Total: {filteredPatients.length}
          </span>
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
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
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

      {/* Date Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div>
          <label className="block font-medium mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        {(dateFrom || dateTo) && (
          <div className="flex items-end">
            <button
              onClick={clearDates}
              className="btn btn-xs btn-ghost flex items-center gap-1"
            >
              <XCircle size={14} /> Clear dates
            </button>
          </div>
        )}
      </div>

      {/* Table */}
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
                <th>Patient&nbsp;ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.map((p) => (
                <tr key={p._id}>
                  <td className="font-mono">{p.patientId}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="flex justify-center gap-2">
                    <button
                      className="btn btn-xs btn-success btn-outline flex items-center gap-1"
                      onClick={() =>
                        navigate("/prescriptions/write", {
                          state: { patientId: p.patientId },
                        })
                      }
                    >
                      <PenSquare size={14} />
                      Write Rx
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

      {/* Pagination */}
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
