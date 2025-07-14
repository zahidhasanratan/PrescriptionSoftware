// src/Pages/Prescription/Prescription.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5; // change to adjust rows per page

export default function PrescriptionList() {
  const navigate = useNavigate();

  const [pres, setPres] = useState([]); // all prescriptions
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);

  /* ─── UI state ─── */
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  /* ─── Fetch once ─── */
  useEffect(() => {
    axios
      .get("https://prescription-ebon.vercel.app/api/prescriptions")
      .then(({ data }) => setPres(data.reverse())) // newest first
      .catch((e) => {
        console.error(e);
        setErr("Failed to load prescriptions.");
      })
      .finally(() => setLoad(false));
  }, []);

  /* ─── Derived list ─── */
  const filtered = pres.filter((p) => {
    /* text search (name, phone, ID, notes…) */
    const txt = [
      p.prescriptionNumber,
      p.patient?.name,
      p.patient?.phone,
      p.patient?.patientId,
      p.notes?.symptoms,
      p.notes?.generalAdvice,
      new Date(p.createdAt).toLocaleDateString(),
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = txt.includes(search.toLowerCase());

    /* date-range match */
    const d = new Date(p.createdAt).setHours(0, 0, 0, 0);
    const inFrom = dateFrom
      ? d >= new Date(dateFrom).setHours(0, 0, 0, 0)
      : true;
    const inTo = dateTo
      ? d <= new Date(dateTo).setHours(23, 59, 59, 999)
      : true;

    return matchesSearch && inFrom && inTo;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const startIdx = (page - 1) * PAGE_SIZE;
  const currentPage = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  /* ─── Helpers ─── */
  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText size={26} className="text-teal-600" />
          <h2 className="text-2xl font-semibold text-teal-800">Prescriptions</h2>
          <span className="text-sm text-gray-500">{filtered.length}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* search box */}
          <div className="relative flex-grow">
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="input input-bordered w-full pr-10"
              autoComplete="off"
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* write new button */}
          <button
            onClick={() => navigate("/prescriptions/write")}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <PlusCircle size={20} />
            Write New
          </button>
        </div>
      </header>

      {/* Date-range filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
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

      {/* Body */}
      {loading ? (
        <p className="p-8 text-center text-gray-500">Loading…</p>
      ) : error ? (
        <p className="p-8 text-center text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-teal-400 p-6 rounded text-center text-teal-700 bg-teal-50">
          🕓 No prescription found for your criteria.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead className="bg-teal-100 text-teal-900">
                <tr>
                  <th className="border px-3 py-2 text-left">Prescription #</th>
                  <th className="border px-3 py-2 text-left">Patient</th>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Symptoms</th>
                  <th className="border px-3 py-2 text-left">Advice</th>
                  <th className="border px-3 py-2 text-center"># Meds</th>
                  <th className="border px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPage.map((doc) => (
                  <tr key={doc._id} className="hover:bg-teal-50">
                    <td className="border px-3 py-2 font-mono">
                      {doc.prescriptionNumber}
                    </td>
                    <td className="border px-3 py-2">
                      {doc.patient?.name || "—"}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className="border px-3 py-2 truncate max-w-xs"
                      title={doc.notes?.symptoms}
                    >
                      {doc.notes?.symptoms || "—"}
                    </td>
                    <td
                      className="border px-3 py-2 truncate max-w-xs"
                      title={doc.notes?.generalAdvice}
                    >
                      {doc.notes?.generalAdvice || "—"}
                    </td>
                    <td className="border px-3 py-2 text-center font-semibold">
                      {doc.medicines?.length || 0}
                    </td>
                    <td className="border px-3 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/prescriptions/${doc._id}`)}
                          className="text-teal-600 hover:text-teal-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/prescriptions/edit/${doc._id}`)
                          }
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="btn btn-circle btn-outline btn-xs"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="btn btn-circle btn-outline btn-xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* named export for convenience */
export { PrescriptionList as Prescription };
