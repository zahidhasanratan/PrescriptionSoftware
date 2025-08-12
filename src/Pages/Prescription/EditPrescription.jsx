// src/Pages/Prescription/EditPrescription.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Trash2, Search } from "lucide-react";

// CKEditor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

/* ---------------------------------- API BASE ---------------------------------
 * Priority:
 * 1) VITE_API_URL (e.g., http://localhost:5000/api)
 * 2) If running on localhost -> http://localhost:5000/api
 * 3) Fallback to prod -> https://prescription-ebon.vercel.app/api
 * --------------------------------------------------------------------------- */
const API_BASE =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/+$/, "")) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://prescription-ebon.vercel.app/api");

export default function EditPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Core doc state
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    patientId: "",
    category: "",
  });
  const [meds, setMeds] = useState([]);

  // live input for a medicine row
  const [medInput, setMedInput] = useState({
    name: "",
    type: "",
    strength: "",
    dosage: "",
    advice: "",
    duration: "7 days",
  });

  // notes
  const [notes, setNotes] = useState({
    symptoms: "",
    tests: "",
    generalAdvice: "",
  });

  // suggestions for medicines
  const [allMeds, setAllMeds] = useState([]); // master list
  const [sugg, setSugg] = useState({});
  const [hi, setHi] = useState({});

  /* ====================== Complaints (IDENTICAL UX to WritePrescription) ====================== */
  // Full catalog: [{_id, name, details: [string]}]
  const [complaintsCatalog, setComplaintsCatalog] = useState([]);
  // Category search/choose
  const [compCatInput, setCompCatInput] = useState("");
  const [compCatSuggest, setCompCatSuggest] = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);

  // Selected complaints used in UI (same structure as Write)
  // { catId, catName, index, text }
  const [selectedComplaints, setSelectedComplaints] = useState([]);

  const activeCategory = useMemo(
    () => complaintsCatalog.find((c) => c._id === activeCatId) || null,
    [complaintsCatalog, activeCatId]
  );

  const isDetailSelected = (catId, idx) =>
    selectedComplaints.some((s) => s.catId === catId && s.index === idx);

  const getSelectedDetailText = (catId, idx, fallback) => {
    const found = selectedComplaints.find((s) => s.catId === catId && s.index === idx);
    return found ? found.text : fallback;
  };

  /* ============================ Load data ============================ */
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [rxRes, medsRes, compsRes] = await Promise.all([
          axios.get(`${API_BASE}/prescriptions/${id}`),
          axios.get(`${API_BASE}/medicines`),
          axios.get(`${API_BASE}/complaints`),
        ]);

        const d = rxRes.data || {};
        setPatient(d.patient || {});
        setMeds(Array.isArray(d.medicines) ? d.medicines : []);
        setNotes(d.notes || {});
        setAllMeds(Array.isArray(medsRes.data) ? medsRes.data : []);

        const catalog = Array.isArray(compsRes?.data) ? compsRes.data : [];
        setComplaintsCatalog(catalog);

        // Map saved complaints (array of strings) into UI objects
        const saved = Array.isArray(d.complaints) ? d.complaints : [];
        const mapped = saved.map((text, i) => {
          const t = (text || "").trim().toLowerCase();
          for (const cat of catalog) {
            const idx = (cat.details || []).findIndex(
              (line) => (line || "").trim().toLowerCase() === t
            );
            if (idx >= 0) {
              return { catId: cat._id, catName: cat.name, index: idx, text };
            }
          }
          // unmatched => treat as a free/custom line, keep editable
          return { catId: `custom-${i}`, catName: "Custom", index: -1, text };
        });
        setSelectedComplaints(mapped);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error").then(() => navigate("/prescriptions"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* ============================ MED: suggestions helpers ============================ */
  const dict = {
    type: ["Tablet", "Capsule", "Injection", "Syrup"],
    strength: ["500mg", "250mg", "1 spoon", "2 spoons", "1/2 spoon"],
    dosage: ["1+0+1", "1+1+1", "0+1+0", "1+0+0", "0+0+1"],
    advice: ["Before Meal", "After Meal", "With Water"],
  };

  const build = (field, val) => {
    const pool = new Set(dict[field] || []);
    allMeds.forEach((m) => {
      if (field === "name") pool.add(m.name);
      if (field === "type") m.types?.forEach((t) => pool.add(t));
      if (field === "strength") m.commonStrengths?.forEach((s) => pool.add(s));
      if (field === "dosage" && m.defaultDosage) pool.add(m.defaultDosage);
      if (field === "advice" && m.usageAdvice) pool.add(m.usageAdvice);
    });
    const list = [...pool].filter((v) =>
      v.toLowerCase().includes((val || "").toLowerCase())
    );
    setSugg((p) => ({ ...p, [field]: list }));
    setHi((p) => ({ ...p, [field]: 0 }));
  };

  const autofill = (name) => {
    const m = allMeds.find((x) => x.name === name);
    if (!m) return;
    setMedInput({
      name: m.name,
      type: m.types?.[0] || "",
      strength: m.commonStrengths?.[0] || "",
      dosage: m.defaultDosage || "",
      advice: m.usageAdvice || "",
      duration: "7 days",
    });
  };

  // medicine field handlers
  const onMedChange = (e) => {
    const { name, value } = e.target;
    setMedInput((p) => ({ ...p, [name]: value }));
    if (["name", "type", "strength", "dosage", "advice"].includes(name)) build(name, value);
  };

  const selectOption = (val, field) => {
    setMedInput((p) => ({ ...p, [field]: val }));
    setSugg((s) => ({ ...s, [field]: [] }));
    if (field === "name") autofill(val);
  };

  const onKey = (e, field) => {
    const lst = sugg[field] || [];
    if (!lst.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => ({ ...h, [field]: ((h[field] || 0) + 1) % lst.length }));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => ({ ...h, [field]: ((h[field] || 0) - 1 + lst.length) % lst.length }));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const idx = hi[field] || 0;
      selectOption(lst[idx], field);
    }
  };

  // med list ops
  const addMed = () => {
    if (!medInput.name || !medInput.dosage) return;
    setMeds((p) => [...p, medInput]);
    setMedInput({
      name: "",
      type: "",
      strength: "",
      dosage: "",
      advice: "",
      duration: "7 days",
    });
  };
  const removeMed = (i) => setMeds((p) => p.filter((_, idx) => idx !== i));

  /* ============================ Complaints UX (COPY from Write) ============================ */
  // Category suggestions (IDENTICAL)
  useEffect(() => {
    const q = compCatInput.trim().toLowerCase();
    if (!q) return setCompCatSuggest([]);
    const byName = complaintsCatalog
      .filter((c) => (c.name || "").toLowerCase().includes(q))
      .slice(0, 8)
      .map((c) => c.name);
    setCompCatSuggest(byName);
  }, [compCatInput, complaintsCatalog]);

  // Pick category (IDENTICAL)
  const selectCategoryByName = (name) => {
    const cat = complaintsCatalog.find(
      (c) => (c.name || "").toLowerCase() === (name || "").toLowerCase()
    );
    if (cat) {
      setActiveCatId(cat._id);
      setCompCatInput(cat.name);
      setCompCatSuggest([]);
    }
  };

  // Toggle detail checkbox (IDENTICAL)
  const toggleDetail = (cat, idx, checked) => {
    if (!cat) return;
    if (checked) {
      if (!isDetailSelected(cat._id, idx)) {
        setSelectedComplaints((prev) => [
          ...prev,
          { catId: cat._id, catName: cat.name, index: idx, text: cat.details[idx] || "" },
        ]);
      }
    } else {
      setSelectedComplaints((prev) => prev.filter((s) => !(s.catId === cat._id && s.index === idx)));
    }
  };

  // Edit selected detail inline (IDENTICAL)
  const editSelectedDetail = (catId, idx, newText) => {
    setSelectedComplaints((prev) =>
      prev.map((s) => (s.catId === catId && s.index === idx ? { ...s, text: newText } : s))
    );
  };

  // Remove selected complaint (IDENTICAL)
  const removeSelectedComplaint = (catId, idx) => {
    setSelectedComplaints((prev) => prev.filter((s) => !(s.catId === catId && s.index === idx)));
  };

  // Quick +/- 1 day adjust (IDENTICAL)
  const nudgeDays = (catId, idx, delta) => {
    const entry = selectedComplaints.find((s) => s.catId === catId && s.index === idx);
    if (!entry) return;
    const m = entry.text.match(/(\d+)\s*(day|days)\b/i);
    if (!m) return;
    const current = parseInt(m[1], 10);
    const next = Math.max(1, current + delta);
    const replaced = entry.text.replace(/(\d+)\s*(day|days)\b/i, `${next} days`);
    editSelectedDetail(catId, idx, replaced);
  };

  /* ============================ Update doc ============================ */
  const update = async () => {
    if (!meds.length) return Swal.fire("Missing", "Add at least one medicine", "warning");

    // SAVE complaints as an array of strings — same as WritePrescription
    const complaintsPayload = selectedComplaints.map((s) => s.text);

    try {
      await axios.put(`${API_BASE}/prescriptions/${id}`, {
        patient,
        medicines: meds,
        notes,
        complaints: complaintsPayload,
      });
      await Swal.fire("Updated", "Prescription updated", "success");
      navigate(`/prescriptions/${id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white shadow p-6 rounded space-y-6">
      <h2 className="text-xl font-bold text-teal-700">Edit Prescription</h2>

      {/* Patient header */}
      <div className="space-y-1 text-sm">
        <p>
          <strong>{patient?.name || "—"}</strong>
        </p>
        <p className="text-gray-600">
          {patient?.age ? <>Age&nbsp;{patient.age},&nbsp;</> : null}
          {patient?.gender ? <>{patient.gender},&nbsp;</> : null}
          {patient?.phone || ""}
        </p>
      </div>

      {/* ============================ NEW: Complaints section (EXACT) ============================ */}
      <div className="space-y-3">
        <label className="font-semibold block">Complaints</label>

        {/* Category search + suggest */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Category</span>
            <div className="relative flex-1">
              <input
                className="input input-bordered w-full pl-8"
                placeholder="e.g., Fever, Hair Fall"
                value={compCatInput}
                onChange={(e) => setCompCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && compCatSuggest.length) selectCategoryByName(compCatSuggest[0]);
                }}
              />
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => selectCategoryByName(compCatInput)}
              title="Select category"
            >
              Use
            </button>
          </div>

          {compCatSuggest.length > 0 && (
            <ul className="absolute bg-white border shadow w-full max-h-44 overflow-auto mt-1 rounded z-10">
              {compCatSuggest.map((name) => (
                <li
                  key={name}
                  className="px-3 py-2 hover:bg-teal-100 cursor-pointer"
                  onMouseDown={() => selectCategoryByName(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Details for active category */}
        {activeCategory ? (
          <div className="border rounded p-3 space-y-2">
            <div className="text-sm text-gray-700">
              Selected Category: <b>{activeCategory.name}</b>
            </div>
            {(activeCategory.details || []).length ? (
              <div className="space-y-2">
                {activeCategory.details.map((line, idx) => {
                  const checked = isDetailSelected(activeCategory._id, idx);
                  const value = getSelectedDetailText(activeCategory._id, idx, line);
                  return (
                    <div key={`${activeCategory._id}-${idx}`} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm mt-1"
                        checked={checked}
                        onChange={(e) => toggleDetail(activeCategory, idx, e.target.checked)}
                      />
                      <div className="flex-1">
                        {!checked ? (
                          <div className="text-sm text-gray-700">{line}</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              className="input input-bordered input-sm w-full"
                              value={value}
                              onChange={(e) => editSelectedDetail(activeCategory._id, idx, e.target.value)}
                            />
                            <div className="join">
                              <button
                                className="btn btn-xs join-item"
                                title="– 1 day"
                                onClick={() => nudgeDays(activeCategory._id, idx, -1)}
                              >
                                −1d
                              </button>
                              <button
                                className="btn btn-xs join-item"
                                title="+ 1 day"
                                onClick={() => nudgeDays(activeCategory._id, idx, +1)}
                              >
                                +1d
                              </button>
                            </div>
                            <button
                              className="btn btn-ghost btn-xs text-red-600"
                              onClick={() => removeSelectedComplaint(activeCategory._id, idx)}
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No details defined for this category.</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Search and select a category to see its options.</div>
        )}

        {/* Selected complaints summary */}
        {selectedComplaints.length > 0 && (
          <div className="bg-gray-50 border rounded p-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">Selected complaints:</div>
            <ul className="list-disc ml-6 space-y-1">
              {selectedComplaints.map((s, i) => (
                <li key={`${s.catId}-${s.index}-${i}`} className="flex items-start gap-2">
                  <span className="flex-1">
                    <b>{s.catName}:</b> {s.text}
                  </span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                    onClick={() => removeSelectedComplaint(s.catId, s.index)}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ============================ Medicine editor ============================ */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["name", "type", "strength", "dosage", "advice", "duration"].map((f) => (
            <div key={f} className="relative">
              <input
                name={f}
                autoComplete="off"
                className="input input-bordered w-full"
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                value={medInput[f]}
                onChange={onMedChange}
                onKeyDown={(e) => onKey(e, f)}
                onBlur={() => f === "name" && autofill(medInput.name)}
              />
              {sugg[f]?.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border shadow max-h-40 overflow-y-auto mt-1 rounded">
                  {sugg[f].map((op, i) => (
                    <li
                      key={op + i}
                      onMouseDown={() => selectOption(op, f)}
                      className={`px-3 py-1 cursor-pointer ${((hi[f] || 0) === i ? "bg-teal-100" : "")}`}
                    >
                      {op}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-sm bg-teal-600 text-white" onClick={addMed}>
          <Plus size={16} /> Add / Update List
        </button>
      </div>

      {/* Medicines list */}
      {meds.map((m, i) => (
        <div
          key={i}
          className="flex justify-between items-center bg-gray-50 border rounded p-2 text-sm"
        >
          <span>
            <strong>{m.name}</strong> {m.type ? <>({m.type})</> : null} {m.strength} – {m.dosage} •{" "}
            {m.duration} {m.advice ? <>• {m.advice}</> : null}
          </span>
          <button onClick={() => removeMed(i)} className="text-red-600 hover:text-red-800">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {/* Notes with CKEditor */}
      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Additional Complaint Notes (optional)</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes?.symptoms || ""}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes((n) => ({ ...n, symptoms: data }));
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tests to do</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes?.tests || ""}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes((n) => ({ ...n, tests: data }));
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">General Advice</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes?.generalAdvice || ""}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes((n) => ({ ...n, generalAdvice: data }));
            }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button className="btn btn-primary px-6" onClick={update}>
          Update &amp; View
        </button>
      </div>
    </div>
  );
}
