// src/Pages/Prescription/WritePrescription.jsx

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Plus,
  Trash2,
  UserPlus,
  Paperclip,
  Eye,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// CKEditor imports
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ← Change this to your real backend base URL
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://prescription-ebon.vercel.app/api";

const CATEGORIES = [
  "G6PD",
  "Hemophilia",
  "HS",
  "CML",
  "COT",
  "CCS",
  "Thalassemia",
];

export const WritePrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    patientId: incomingPatientId,
    forwardedReports = [],
  } = location.state || {};

  // Patients
  const [patients, setPatients]               = useState([]);
  const [searchQuery, setSearchQuery]         = useState("");
  const [showDropdown, setShowDropdown]       = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name:     "",
    age:      "",
    gender:   "",
    phone:    "",
    category: CATEGORIES[0],
  });

  // Reports
  const [dbReports, setDbReports] = useState([]);

  // Medicines
  const [allMedicines, setAllMedicines]     = useState([]);
  const [medicineInput, setMedicineInput]   = useState({
    name: "", type: "", strength: "", dosage: "", advice: "", duration: "7 days",
  });
  const [suggestions, setSuggestions]       = useState({});
  const [highlighted, setHighlighted]       = useState({});
  const [addedMedicines, setAddedMedicines] = useState([]);

  // Notes (rich-text HTML)
  const [notes, setNotes] = useState({
    symptoms:      "",
    tests:         "",
    generalAdvice: "",
  });

  // Load patients & medicines
  useEffect(() => {
    axios.get(`${API_BASE}/patients`)
      .then(r => Array.isArray(r.data) && setPatients(r.data))
      .catch(() => Swal.fire("Error","Failed to load patients","error"));

    axios.get(`${API_BASE}/medicines`)
      .then(r => Array.isArray(r.data) && setAllMedicines(r.data))
      .catch(() => Swal.fire("Error","Failed to load medicines","error"));
  }, []);

  // Auto-select incoming patient if provided
  useEffect(() => {
    if (!incomingPatientId || !patients.length) return;
    const p = patients.find(pt => pt.patientId === incomingPatientId);
    if (p) handleSelectPatient(p);
  }, [patients, incomingPatientId]);

  // Load DB reports for selected patient
  useEffect(() => {
    if (!selectedPatient) return setDbReports([]);
    axios.get(`${API_BASE}/reports`, {
      params: { patientId: selectedPatient.patientId }
    })
    .then(({ data }) => {
      setDbReports(Array.isArray(data)
        ? data.map(r => ({
            url:        r.url,
            name:       r.name,
            reportDate: r.reportDate || r.createdAt,
          }))
        : []
      );
    })
    .catch(() => setDbReports([]));
  }, [selectedPatient]);

  // Merge forwarded + DB reports, dedupe by URL
  const combinedReports = useMemo(() => {
    const m = new Map();
    [...forwardedReports, ...dbReports].forEach(r => {
      if (!m.has(r.url)) m.set(r.url, r);
    });
    return Array.from(m.values()).sort(
      (a,b) => new Date(b.reportDate) - new Date(a.reportDate)
    );
  }, [forwardedReports, dbReports]);

  /*** Patient handlers ***/
  const handlePatientSearch = e => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };
  const handleSelectPatient = p => {
    setSelectedPatient(p);
    setPatientForm({
      name:     p.name,
      age:      p.age,
      gender:   p.gender,
      phone:    p.phone,
      category: p.category || CATEGORIES[0],
    });
    setSearchQuery(`${p.name} — ${p.phone}`);
    setShowDropdown(false);
  };
  const createPatientIfNeeded = async () => {
    if (selectedPatient) return selectedPatient;
    if (!patientForm.name) {
      await Swal.fire("Required","Patient name is required","warning");
      return null;
    }
    try {
      const payload = {
        ...patientForm,
        patientId: Date.now().toString(),
      };
      const { data } = await axios.post(`${API_BASE}/patients`, payload);
      setPatients(ps => [data, ...ps]);
      setSelectedPatient(data);
      Swal.fire("Success","Patient added","success");
      return data;
    } catch {
      Swal.fire("Error","Failed to save patient","error");
      return null;
    }
  };

  /*** Medicine autocomplete ***/
  const staticDict = {
    type:       ["Tablet","Capsule","Injection","Syrup"],
    strength:   ["500mg","250mg","1 spoon","2 spoons","1/2 spoon"],
    dosage:     ["1+0+1","1+1+1","0+1+0","1+0+0","0+0+1"],
    advice:     ["Before Meal","After Meal","With Water"],
  };
  const buildSuggestions = (field, val) => {
    const pool = new Set(staticDict[field] || []);
    allMedicines.forEach(m => {
      if (field==="name")       pool.add(m.name);
      if (field==="type")       m.types?.forEach(t=>pool.add(t));
      if (field==="strength")   m.commonStrengths?.forEach(s=>pool.add(s));
      if (field==="dosage" && m.defaultDosage)  pool.add(m.defaultDosage);
      if (field==="advice" && m.usageAdvice)    pool.add(m.usageAdvice);
    });
    const list = [...pool].filter(v => v.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(s => ({ ...s, [field]: list }));
    setHighlighted(h => ({ ...h, [field]: 0 }));
  };
  const autofillFromName = name => {
    const m = allMedicines.find(x=>x.name===name);
    if (!m) return;
    setMedicineInput({
      name:     m.name,
      type:     m.types?.[0] || "",
      strength: m.commonStrengths?.[0] || "",
      dosage:   m.defaultDosage || "",
      advice:   m.usageAdvice || "",
      duration: "7 days",
    });
  };
  const handleMedChange = e => {
    const { name, value } = e.target;
    setMedicineInput(mi => ({ ...mi, [name]: value }));
    if (["name","type","strength","dosage","advice"].includes(name))
      buildSuggestions(name, value);
  };
  const handleMedKeyDown = (e, field) => {
    const list = suggestions[field] || [];
    if (!list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => ({ ...h, [field]: (h[field]+1) % list.length }));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => ({ ...h, [field]: (h[field]-1+list.length) % list.length }));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const choice = list[highlighted[field]];
      setMedicineInput(mi => ({ ...mi, [field]: choice }));
      setSuggestions(s => ({ ...s, [field]: [] }));
      if (field==="name") autofillFromName(choice);
    }
  };
  const addMedicine = () => {
    if (!medicineInput.name || !medicineInput.dosage) return;
    setAddedMedicines(a => [...a, medicineInput]);
    setMedicineInput({ name:"", type:"", strength:"", dosage:"", advice:"", duration:"7 days" });
  };
  const removeMedicine = idx =>
    setAddedMedicines(a => a.filter((_,i)=>i!==idx));

  /*** View attached reports in a carousel ***/
  const viewReports = () => {
    if (!combinedReports.length) return;
    const showAt = i => {
      const r = combinedReports[i];
      const dateTxt = r.reportDate
        ? new Date(r.reportDate).toLocaleDateString()
        : "Unknown";
      Swal.fire({
        title: `${r.name} — ${dateTxt}`,
        html: `<div style="display:flex;justify-content:center">
                 <img src="${r.url}" style="max-height:70vh;object-fit:contain" />
               </div>`,
        showCloseButton:    true,
        showDenyButton:     true,
        showConfirmButton:  true,
        denyButtonText:     "← Prev",
        confirmButtonText:  "Next →",
        didOpen: () => {
          Swal.getDenyButton().disabled    = i===0;
          Swal.getConfirmButton().disabled = i===combinedReports.length-1;
        }
      }).then(res=>{
        if (res.isConfirmed && i<combinedReports.length-1) showAt(i+1);
        if (res.isDenied    && i>0)                  showAt(i-1);
      });
    };
    showAt(0);
  };

  /*** Save prescription ***/
  const savePrescription = async () => {
    if (!addedMedicines.length)
      return Swal.fire("Missing","No medicines added","warning");

    const pat = await createPatientIfNeeded();
    if (!pat) return;

    // build prescriptionNumber
    const prefix = patientForm.category.slice(0,2).toUpperCase();
    const allRx  = await axios.get(`${API_BASE}/prescriptions`).then(r=>r.data);
    const serial = allRx.filter(r=>r.prescriptionNumber?.startsWith(prefix)).length + 1;
    const prescriptionNumber = `${prefix}/${serial}`;

    const payload = {
      patient: {
        name:       pat.name,
        age:        pat.age,
        gender:     pat.gender,
        phone:      pat.phone,
        patientId:  pat.patientId,
        category:   patientForm.category,
      },
      medicines:          addedMedicines,
      notes,               // HTML from CKEditor
      attachedReports:    combinedReports,
      prescriptionNumber,
    };

    try {
      const { data } = await axios.post(
        `${API_BASE}/prescriptions`,
        payload
      );
      await Swal.fire("Saved","Prescription saved!","success");
      navigate(`/prescriptions/${data._id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error","Failed to save prescription","error");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-6">
      {/* Attached reports banner */}
      {combinedReports.length > 0 && (
        <div className="alert alert-info flex items-center gap-3">
          <Paperclip size={18}/>
          <span>
            {combinedReports.length} report
            {combinedReports.length > 1 ? "s" : ""} attached
          </span>
          <button
            className="btn btn-xs btn-outline"
            onClick={viewReports}
          >
            <Eye size={14}/> View
          </button>
        </div>
      )}

      {/* Patient search + form */}
      <div className="space-y-4 relative">
        <label className="font-semibold block mb-1">Search Patient</label>
        <input
          className="input input-bordered w-full"
          placeholder="Name, Phone or ID"
          value={searchQuery}
          onChange={handlePatientSearch}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && (
          <ul className="absolute bg-white border shadow w-full max-h-40 overflow-auto mt-1 rounded z-10">
            {patients
              .filter(p => [p.name,p.phone,p.patientId]
                .join(" ").toLowerCase()
                .includes(searchQuery.toLowerCase()))
              .map(p => (
                <li
                  key={p._id}
                  className="px-4 py-2 hover:bg-teal-100 cursor-pointer"
                  onClick={() => handleSelectPatient(p)}
                >
                  {p.name} — {p.phone}
                </li>
              ))
            }
          </ul>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            className="input input-bordered"
            placeholder="Name"
            value={patientForm.name}
            onChange={e => setPatientForm({...patientForm,name:e.target.value})}
          />
          <input
            className="input input-bordered"
            type="number"
            placeholder="Age"
            value={patientForm.age}
            onChange={e => setPatientForm({...patientForm,age:e.target.value})}
          />
          <select
            className="select select-bordered"
            value={patientForm.gender}
            onChange={e => setPatientForm({...patientForm,gender:e.target.value})}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <input
            className="input input-bordered"
            placeholder="Phone"
            value={patientForm.phone}
            onChange={e => setPatientForm({...patientForm,phone:e.target.value})}
          />
          <select
            className="select select-bordered"
            value={patientForm.category}
            onChange={e => setPatientForm({...patientForm,category:e.target.value})}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {!selectedPatient && (
          <button
            className="btn btn-outline btn-success btn-sm"
            onClick={createPatientIfNeeded}
          >
            <UserPlus size={16}/> Save New Patient
          </button>
        )}
      </div>

      {/* Medicine section */}
      <div className="space-y-2">
        <label className="font-semibold block">Add Medicine</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["name","type","strength","dosage","advice","duration"].map(field => (
            <div key={field} className="relative">
              <input
                name={field}
                className="input input-bordered w-full"
                placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                value={medicineInput[field]}
                onChange={handleMedChange}
                onKeyDown={e => handleMedKeyDown(e,field)}
                onBlur={() => field==="name" && autofillFromName(medicineInput.name)}
              />
              {suggestions[field]?.length > 0 && (
                <ul className="absolute bg-white border shadow w-full max-h-40 overflow-auto mt-1 rounded z-10">
                  {suggestions[field].map((opt,i) => (
                    <li
                      key={opt+i}
                      className={`px-3 py-1 cursor-pointer ${highlighted[field]===i ? "bg-teal-100" : ""}`}
                      onMouseDown={() => {
                        setMedicineInput(mi=>({...mi,[field]:opt}));
                        setSuggestions(s=>({...s,[field]:[]}));
                        if (field==="name") autofillFromName(opt);
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <button
          className="btn btn-sm bg-teal-600 text-white mt-2"
          onClick={addMedicine}
        >
          <Plus size={16}/> Add Medicine
        </button>
      </div>

      {/* Added medicines preview */}
      {addedMedicines.length > 0 && (
        <div className="bg-gray-50 border rounded p-4 space-y-2">
          <p className="font-medium text-gray-700">Added Medicines:</p>
          {addedMedicines.map((m,i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white p-3 rounded border"
            >
              <div>
                <strong>{m.name}</strong> ({m.type}) {m.strength}<br/>
                <small>
                  Dosage: {m.dosage}, Duration: {m.duration}, Advice: {m.advice}
                </small>
              </div>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => removeMedicine(i)}
              >
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CKEditor Notes */}
      <div className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Complaints</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes.symptoms}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes(n => ({ ...n, symptoms: data }));
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tests to do</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes.tests}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes(n => ({ ...n, tests: data }));
            }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">General Advice</label>
          <CKEditor
            editor={ClassicEditor}
            data={notes.generalAdvice}
            onChange={(_, editor) => {
              const data = editor.getData();
              setNotes(n => ({ ...n, generalAdvice: data }));
            }}
          />
        </div>
      </div>

      {/* Save & View */}
      <div className="flex justify-end mt-6">
        <button className="btn btn-primary px-6" onClick={savePrescription}>
          Save & View
        </button>
      </div>
    </div>
  );
};
