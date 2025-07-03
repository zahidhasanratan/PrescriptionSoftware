/* ------------------------------------------------------------------
   src/Pages/History/PrescriptionHistory.jsx
------------------------------------------------------------------- */
import React, { useState, useRef, useEffect } from "react";
import {
  History,
  Search,
  Eye,
  FileText,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

/* ───────────────────── Searchable Dropdown ───────────────────── */
const SearchableDropdown = ({ options, selected, onChange, optionLabel }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef(null);

  const visible = options.filter((o) =>
    optionLabel(o).toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center rounded border px-3 py-2 bg-white"
      >
        <span>
          {selected ? optionLabel(selected) : "Select Patient"}
        </span>
        <Search size={18} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded border bg-white shadow">
          <input
            autoFocus
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search…"
            className="w-full border-b px-3 py-2 outline-none"
          />
          <ul className="max-h-60 overflow-auto">
            {visible.length ? (
              visible.map((o) => (
                <li
                  key={o.patientId}
                  className={`px-3 py-2 cursor-pointer hover:bg-teal-100 ${
                    selected?.patientId === o.patientId
                      ? "bg-teal-200 font-semibold"
                      : ""
                  }`}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setFilter("");
                  }}
                >
                  {optionLabel(o)}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ────────────────────────── Main Component ───────────────────────── */
export const PrescriptionHistory = () => {
  const navigate = useNavigate();
  const PAGE_SIZE = 6;

  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, rxRes] = await Promise.all([
          axios.get("https://prescription-ebon.vercel.app/api/patients"),
          axios.get("https://prescription-ebon.vercel.app/api/prescriptions"),
        ]);
        setPatients(pRes.data);
        setPrescriptions(rxRes.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const matchPatient = selectedPatient
      ? rx.patient.patientId === selectedPatient.patientId
      : true;

    const d = new Date(rx.createdAt).setHours(0, 0, 0, 0);
    const matchFrom = dateFrom
      ? d >= new Date(dateFrom).setHours(0, 0, 0, 0)
      : true;
    const matchTo = dateTo
      ? d <= new Date(dateTo).setHours(23, 59, 59, 999)
      : true;

    return matchPatient && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSelectedPatient(null);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const header = ["Patient", "Phone", "Patient ID", "Date"];
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        [
          `"${r.patient.name}"`,
          `"${r.patient.phone}"`,
          r.patient.patientId,
          new Date(r.createdAt).toLocaleDateString(),
          r.attachedReports?.length || (r.attachedReport ? 1 : 0),
        ].join(",")
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "prescription_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const showReports = (arr = []) => {
    if (!arr.length) return;
    const list = Array.isArray(arr) ? arr : [arr];
    const loop = (i) => {
      const r = list[i];
      Swal.fire({
        title: `${r.name || "Report"} — ${new Date(
          r.reportDate || r.createdAt
        ).toLocaleDateString()}`,
        html: `<div style="display:flex;justify-content:center">
                 <img src="${r.url}" style="max-height:70vh;object-fit:contain"/>
               </div>`,
        showCloseButton: true,
        showConfirmButton: true,
        showDenyButton: true,
        confirmButtonText: "Next →",
        denyButtonText: "← Prev",
        allowOutsideClick: false,
        width: "60rem",
        didOpen: () => {
          if (i === 0) Swal.getDenyButton().disabled = true;
          if (i === list.length - 1) Swal.getConfirmButton().disabled = true;
        },
      }).then((res) => {
        if (res.isConfirmed && i < list.length - 1) loop(i + 1);
        if (res.isDenied && i > 0) loop(i - 1);
      });
    };
    loop(0);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="loading loading-spinner loading-lg text-teal-600"></span>
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto font-poppins space-y-6">
      <div className="flex items-center gap-3">
        <History size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">
          Prescription History
        </h2>
        <span className="text-sm text-gray-500">{filtered.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <div>
          <label className="block font-medium mb-1">Patient</label>
          <SearchableDropdown
            options={patients}
            selected={selectedPatient}
            onChange={setSelectedPatient}
            optionLabel={(p) => `${p.name} — ${p.phone} — ${p.patientId}`}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">From</label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To</label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {(selectedPatient || dateFrom || dateTo) && (
        <div className="flex items-center gap-4">
          <button
            onClick={clearFilters}
            className="btn btn-xs btn-ghost flex items-center gap-1"
          >
            <XCircle size={14} /> Clear filters
          </button>
          <button
            onClick={exportCSV}
            className="btn btn-xs btn-outline flex items-center gap-1"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      )}

      {paginated.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead className="bg-teal-100 text-teal-900">
                <tr>
                  <th className="border px-3 py-2 text-left">Patient</th>
                  <th className="border px-3 py-2 text-left">Patient&nbsp;ID</th>
                  <th className="border px-3 py-2 text-left">Phone</th>
                  <th className="border px-3 py-2 text-left">Date</th>
                 
                  <th className="border px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((rx) => {
                  const reportsArr = rx.attachedReports?.length
                    ? rx.attachedReports
                    : rx.attachedReport
                    ? [rx.attachedReport]
                    : [];
                  return (
                    <tr key={rx._id} className="hover:bg-teal-50">
                      <td className="border px-3 py-2">{rx.patient.name}</td>
                      <td className="border px-3 py-2">
                        {rx.patient.patientId}
                      </td>
                      <td className="border px-3 py-2">
                        {rx.patient.phone}
                      </td>
                      <td className="border px-3 py-2">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </td>
                     
                      <td className="border px-3 py-2 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            title="View prescription"
                            onClick={() =>
                              navigate(`/prescriptions/${rx._id}`)
                            }
                            className="text-teal-600 hover:text-teal-800"
                          >
                            <Eye size={18} />
                          </button>
                         
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="btn btn-circle btn-outline btn-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="btn btn-circle btn-outline btn-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No prescriptions found.</p>
      )}
    </div>
  );
};
