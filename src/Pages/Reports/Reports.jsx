// src/Pages/Reports/Reports.jsx
import React, { useState, useRef, useEffect } from "react";
import { Folder, Search, Upload, Trash2, Download, X } from "lucide-react";

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

export const Reports = () => {
  const [patients] = useState([
    "John Doe",
    "Jane Smith",
    "Ali Hossain",
    "Maria Garcia",
    "Liam Johnson",
    "Emma Wilson",
  ]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Blood Test Report.pdf",
      uploadedAt: "2025-06-20",
      url: "#",
    },
    {
      id: 2,
      name: "X-Ray Image.jpg",
      uploadedAt: "2025-06-18",
      url: "#",
    },
  ]);
  const [uploading, setUploading] = useState(false);

  // For storing files with custom report names before upload
  const [filesToUpload, setFilesToUpload] = useState([]);

  const fileInputRef = React.useRef();

  // Handle file input change - add files with default report names
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Add files with default reportName as filename without extension
    const newFiles = Array.from(files).map((file) => ({
      file,
      reportName: file.name.replace(/\.[^/.]+$/, ""), // filename without extension
      id: Math.random().toString(36).substr(2, 9),
    }));

    setFilesToUpload((prev) => [...prev, ...newFiles]);
    e.target.value = null; // reset input
  };

  // Update reportName in filesToUpload for each file
  const handleReportNameChange = (id, newName) => {
    setFilesToUpload((prev) =>
      prev.map((f) => (f.id === id ? { ...f, reportName: newName } : f))
    );
  };

  // Remove file before upload
  const handleRemoveFile = (id) => {
    setFilesToUpload((prev) => prev.filter((f) => f.id !== id));
  };

  // Simulate upload of files with custom report names
  const handleUpload = () => {
    if (!selectedPatient) {
      alert("Please select a patient before uploading.");
      return;
    }
    if (filesToUpload.length === 0) {
      alert("Please select files to upload.");
      return;
    }
    setUploading(true);

    setTimeout(() => {
      const newReports = filesToUpload.map(({ file, reportName }) => ({
        id: Date.now() + Math.random(),
        name: reportName + file.name.match(/\.[^/.]+$/)[0], // add original extension
        uploadedAt: new Date().toISOString().slice(0, 10),
        url: "#",
      }));

      setReports((prev) => [...newReports, ...prev]);
      setFilesToUpload([]);
      setUploading(false);
    }, 1500);
  };

  // Delete existing report
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Filter reports by patient - demo logic: show all if selected patient else empty
  const filteredReports = selectedPatient ? reports : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto font-poppins">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Folder size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">Medical Reports</h2>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        Manage patient medical reports including uploads, reviews, and downloads.
        Integration with prescriptions and patient profiles coming soon.
      </p>

      {/* Patient Searchable Dropdown */}
      <div className="mb-6 max-w-sm">
        <label className="block font-medium mb-1">Select Patient</label>
        <SearchableDropdown
          options={patients}
          selected={selectedPatient}
          onChange={setSelectedPatient}
        />
      </div>

      {/* Upload Section */}
      {selectedPatient && (
        <div className="mb-6 max-w-3xl">
          <label className="block font-medium mb-2">Upload New Reports</label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full cursor-pointer rounded border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Files to upload list with editable report names */}
          {filesToUpload.length > 0 && (
            <div className="mt-4 border border-teal-300 rounded bg-gray-50 p-4">
              <h4 className="font-semibold mb-3 text-teal-700">
                Files to upload:
              </h4>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {filesToUpload.map(({ id, reportName, file }) => (
                  <li
                    key={id}
                    className="flex items-center gap-3"
                    title={file.name}
                  >
                    <input
                      type="text"
                      value={reportName}
                      onChange={(e) => handleReportNameChange(id, e.target.value)}
                      className="input input-bordered flex-grow"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      ({file.name.split(".").pop()})
                    </span>
                    <button
                      onClick={() => handleRemoveFile(id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Remove file"
                    >
                      <Trash2 />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={18} className="inline mr-2" />
                {uploading ? "Uploading..." : "Upload Reports"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reports List */}
      {selectedPatient && (
        <>
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto max-w-5xl">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-teal-100 text-teal-900">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Report Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Uploaded At
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-teal-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {report.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {report.uploadedAt}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1 text-white hover:bg-teal-700 transition"
                          title="Download/View"
                        >
                          <Download size={16} /> View
                        </a>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No reports uploaded for this patient.</p>
          )}
        </>
      )}

      {/* No patient selected */}
      {!selectedPatient && (
        <p className="text-gray-500 mt-4">Please select a patient to view reports.</p>
      )}
    </div>
  );
};
