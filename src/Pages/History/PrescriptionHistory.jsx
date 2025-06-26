import React, { useState, useRef, useEffect } from "react";
import { History, Search, FileText } from "lucide-react";
import { Link } from "react-router-dom";
// Reusable Searchable Dropdown
const SearchableDropdown = ({ options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onChange(value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected || "Select Patient"}</span>
        <Search size={20} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
          <input
            type="text"
            className="w-full border-b border-gray-300 px-3 py-2 focus:outline-none"
            placeholder="Search patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <ul className="max-h-52 overflow-auto" role="listbox" tabIndex={-1}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  className={`cursor-pointer px-3 py-2 hover:bg-teal-100 ${
                    opt === selected ? "bg-teal-200 font-semibold" : ""
                  }`}
                  role="option"
                  aria-selected={opt === selected}
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No results found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export const PrescriptionHistory = () => {
  const [patients] = useState([
    "John Doe",
    "Jane Smith",
    "Ali Hossain",
    "Maria Garcia",
  ]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [prescriptions] = useState([
    {
      id: 1,
      patient: "John Doe",
      date: "2025-06-20",
      diagnosis: "Flu, Fever",
      url: "#",
    },
    {
      id: 2,
      patient: "Jane Smith",
      date: "2025-06-18",
      diagnosis: "Back Pain",
      url: "#",
    },
    {
      id: 3,
      patient: "John Doe",
      date: "2025-06-15",
      diagnosis: "Gastritis",
      url: "#",
    },
  ]);

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesPatient = selectedPatient ? p.patient === selectedPatient : true;
    const matchesSearch = searchTerm
      ? p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesPatient && matchesSearch;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto font-poppins">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <History size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">Prescription History</h2>
      </div>

      <p className="text-gray-600 mb-6">
        View all previous prescriptions written for patients. You can search by patient name or diagnosis.
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-3xl">
        <div>
          <label className="block font-medium mb-1">Filter by Patient</label>
          <SearchableDropdown
            options={patients}
            selected={selectedPatient}
            onChange={setSelectedPatient}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Search by Diagnosis</label>
          <input
            type="text"
            placeholder="e.g. Fever, Pain"
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {filteredPrescriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300">
            <thead className="bg-teal-100 text-teal-900">
              <tr>
                <th className="border px-4 py-2 text-left">Patient</th>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Diagnosis</th>
                <th className="border px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((presc) => (
                <tr key={presc.id} className="hover:bg-teal-50">
                  <td className="border px-4 py-2">{presc.patient}</td>
                  <td className="border px-4 py-2">{presc.date}</td>
                  <td className="border px-4 py-2">{presc.diagnosis}</td>
                  <td className="border px-4 py-2 text-center">
                    <Link
  to={`/historyView/${presc.id}`}
  className="inline-flex items-center gap-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition"
>
  <FileText size={16} />
  View
</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No prescriptions found.</p>
      )}
    </div>
  );
};
