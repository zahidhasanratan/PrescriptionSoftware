// src/Pages/Prescription/WritePrescription.jsx
import React, { useEffect, useState } from "react";
import axios                         from "axios";
import Swal                          from "sweetalert2";
import { Plus, Trash2, UserPlus }    from "lucide-react";
import { useNavigate }               from "react-router-dom";

/* ------------------------------------------------------------ */
/*                       COMPONENT                              */
/* ------------------------------------------------------------ */
export const WritePrescription = () => {
  const navigate = useNavigate();

  /* ─────────────── Patient state ─────────────── */
  const [patients,         setPatients]         = useState([]);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showDropdown,     setShowDropdown]     = useState(false);
  const [selectedPatient,  setSelectedPatient]  = useState(null);
  const [patientForm,      setPatientForm]      = useState({
    name: "", age: "", gender: "", phone: "",
  });

  /* ─────────────── Medicine state ─────────────── */
  const [allMedicines,     setAllMedicines]     = useState([]);
  const [medicineInput,    setMedicineInput]    = useState({
    name: "", type: "", strength: "", dosage: "", advice: "", duration: "7 days",
  });
  const [suggestions,      setSuggestions]      = useState({});
  const [highlighted,      setHighlighted]      = useState({});
  const [addedMedicines,   setAddedMedicines]   = useState([]);

  /* ─────────────── Notes state ─────────────── */
  const [notes, setNotes] = useState({ symptoms: "", tests: "", generalAdvice: "" });

  /* ─────────────── Load patients + medicines on mount ─────────────── */
  useEffect(() => {
    axios.get("http://localhost:5000/api/patients")
         .then(r => setPatients(r.data))
         .catch(() => Swal.fire("Error", "Failed to load patients", "error"));

    axios.get("http://localhost:5000/api/medicines")
         .then(r => setAllMedicines(r.data))
         .catch(() => Swal.fire("Error", "Failed to load medicines", "error"));
  }, []);

  /* ================================================================
     ==============  PATIENT  =======================================
     ================================================================*/
  const handlePatientSearch = e => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectPatient = p => {
    setSelectedPatient(p);
    setPatientForm(p);
    setSearchQuery(`${p.name} — ${p.phone}`);
    setShowDropdown(false);
  };

  /**  Create patient (returns saved doc or null) */
  const createPatientIfNeeded = async () => {
    if (selectedPatient) return selectedPatient;
    if (!patientForm.name) {
      await Swal.fire("Required", "Patient name is required", "warning");
      return null;
    }
    try {
      const payload  = { ...patientForm, patientId: Date.now().toString() };
      const { data } = await axios.post("http://localhost:5000/api/patients", payload);
      setPatients(prev => [...prev, data]);
      setSelectedPatient(data);
      Swal.fire("Success", "Patient added", "success");
      return data;
    } catch {
      Swal.fire("Error", "Failed to save patient", "error");
      return null;
    }
  };

  /* ================================================================
     ==============  MEDICINE SUGGESTION  ============================
     ================================================================*/
  const staticDict = {
    type:     ["Tablet", "Capsule", "Injection", "Syrup"],
    strength: ["500mg", "250mg", "1 spoon", "2 spoons", "1/2 spoon"],
    dosage:   ["1+0+1", "1+1+1", "0+1+0", "1+0+0"],
    advice:   ["Before Meal", "After Meal", "With Water"],
  };

  const buildSuggestions = (field, value) => {
    const pool = new Set(staticDict[field] || []);

    allMedicines.forEach(m => {
      if (field === "name")      pool.add(m.name);
      if (field === "type")      m.types?.forEach(t => pool.add(t));
      if (field === "strength")  m.commonStrengths?.forEach(s => pool.add(s));
      if (field === "dosage"  && m.defaultDosage) pool.add(m.defaultDosage);
      if (field === "advice"  && m.usageAdvice)   pool.add(m.usageAdvice);
    });

    const list = [...pool].filter(v => v.toLowerCase().includes(value.toLowerCase()));
    setSuggestions(prev => ({ ...prev, [field]: list }));
    setHighlighted(prev => ({ ...prev, [field]: 0 }));
  };

  /** Auto-fill remaining fields when a known medicine is picked */
  const autofillFromName = (name) => {
    const m = allMedicines.find(x => x.name === name);
    if (!m) return;
    setMedicineInput({
      name: m.name,
      type: m.types?.[0]           || "",
      strength: m.commonStrengths?.[0] || "",
      dosage: m.defaultDosage      || "",
      advice: m.usageAdvice        || "",
      duration: "7 days",
    });
  };

  /* ───── medicine text handlers ───── */
  const handleMedChange = e => {
    const { name, value } = e.target;
    setMedicineInput(p => ({ ...p, [name]: value }));
    if (["name", "type", "strength", "dosage", "advice"].includes(name))
      buildSuggestions(name, value);
  };

  const handleMedKeyDown = (e, field) => {
    const list = suggestions[field] || [];
    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => ({ ...h, [field]: (h[field] + 1) % list.length }));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => ({ ...h, [field]: (h[field] - 1 + list.length) % list.length }));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const choice = list[highlighted[field]];
      setMedicineInput(p => ({ ...p, [field]: choice }));
      setSuggestions(s => ({ ...s, [field]: [] }));
      if (field === "name") autofillFromName(choice);
    }
  };

  /* ================================================================
     ==============  MED LIST HANDLERS  =============================
     ================================================================*/
  const addMedicine = () => {
    if (!medicineInput.name || !medicineInput.dosage) return;
    setAddedMedicines(p => [...p, medicineInput]);
    setMedicineInput({ name: "", type: "", strength: "", dosage: "", advice: "", duration: "7 days" });
  };

  const removeMedicine = idx => setAddedMedicines(p => p.filter((_, i) => i !== idx));

  /* ================================================================
     ==============  SAVE PRESCRIPTION  =============================
     ================================================================*/
  const savePrescription = async () => {
    if (!addedMedicines.length) {
      return Swal.fire("Missing", "No medicines added", "warning");
    }

    const patientDoc = await createPatientIfNeeded();
    if (!patientDoc) return;         // something went wrong or cancelled

    const payload = {
      patient: {
        name:   patientDoc.name,
        age:    patientDoc.age,
        gender: patientDoc.gender,
        phone:  patientDoc.phone,
        patientId: patientDoc.patientId,
      },
      medicines: addedMedicines,
      notes,
    };

    try {
      const { data } = await axios.post("http://localhost:5000/api/prescriptions", payload);
      await Swal.fire("Saved", "Prescription saved!", "success");
      navigate(`/prescriptions/${data._id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save prescription", "error");
    }
  };

  /* ******************************************************************
     ****************************** UI ********************************
     ****************************************************************** */
  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-6">
      {/* =================== Patient Section =================== */}
      <div className="space-y-4">
        {/* Search box */}
        <div className="relative">
          <label className="font-semibold block mb-1">Search Patient</label>
          <input
            className="input input-bordered w-full" autoComplete="off"
            placeholder="Name, Phone, or Patient ID"
            value={searchQuery} onChange={handlePatientSearch}
          />
          {showDropdown && (
            <ul className="absolute z-10 bg-white border shadow w-full max-h-40 overflow-y-auto rounded mt-1">
              {patients
                .filter(p => [p.name, p.phone, p.patientId].join(" ").toLowerCase().includes(searchQuery.toLowerCase()))
                .map(p => (
                  <li key={p._id}
                      className="px-4 py-2 hover:bg-teal-100 cursor-pointer"
                      onClick={() => handleSelectPatient(p)}>
                    {p.name} — {p.phone}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Editable patient fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input  className="input input-bordered w-full" autoComplete="off"
                  placeholder="Name"   value={patientForm.name}
                  onChange={e => setPatientForm({...patientForm, name: e.target.value})}/>
          <input  className="input input-bordered w-full" autoComplete="off"
                  placeholder="Age"    type="number" value={patientForm.age}
                  onChange={e => setPatientForm({...patientForm, age: e.target.value})}/>
          <select className="select select-bordered w-full"
                  value={patientForm.gender}
                  onChange={e => setPatientForm({...patientForm, gender: e.target.value})}>
            <option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
          <input  className="input input-bordered w-full" autoComplete="off"
                  placeholder="Phone"  value={patientForm.phone}
                  onChange={e => setPatientForm({...patientForm, phone: e.target.value})}/>
        </div>

        {!selectedPatient && (
          <button className="btn btn-outline btn-success btn-sm mt-2" onClick={createPatientIfNeeded}>
            <UserPlus size={16}/> Save New Patient
          </button>
        )}
      </div>

      {/* =================== Medicine Section =================== */}
      <div className="space-y-2">
        <label className="font-semibold block">Add Medicine</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["name", "type", "strength", "dosage", "advice", "duration"].map(field => (
            <div key={field} className="relative">
              <input
                name={field} autoComplete="off"
                className="input input-bordered w-full"
                placeholder={field[0].toUpperCase() + field.slice(1)}
                value={medicineInput[field]}
                onChange={handleMedChange}
                onKeyDown={e => handleMedKeyDown(e, field)}
                onBlur={() => field==="name" && autofillFromName(medicineInput.name)}
              />
              {suggestions[field]?.length > 0 && (
                <ul className="absolute z-10 bg-white border shadow w-full max-h-40 overflow-y-auto rounded mt-1">
                  {suggestions[field].map((opt,i) => (
                    <li key={opt+i}
                        className={`px-3 py-2 cursor-pointer ${highlighted[field]===i?"bg-teal-100":""}`}
                        onMouseDown={()=>{
                          setMedicineInput(p=>({...p,[field]:opt}));
                          setSuggestions(s=>({...s,[field]:[]}));
                          if(field==="name") autofillFromName(opt);
                        }}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <button className="btn btn-sm bg-teal-600 text-white mt-2" onClick={addMedicine}>
          <Plus size={16}/> Add Medicine
        </button>
      </div>

      {/* Medicine preview list */}
      {addedMedicines.length>0 && (
        <div className="bg-gray-50 border rounded p-4 space-y-2">
          <p className="font-medium text-gray-700">Added Medicines:</p>
          {addedMedicines.map((m,i)=>(
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded border">
              <div>
                <strong>{m.name}</strong> ({m.type}) {m.strength}<br/>
                <small>Dosage: {m.dosage}, Duration: {m.duration}, Advice: {m.advice}</small>
              </div>
              <button className="text-red-600 hover:text-red-800" onClick={()=>removeMedicine(i)}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Symptoms"
                  value={notes.symptoms} onChange={e=>setNotes({...notes,symptoms:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Tests"
                  value={notes.tests} onChange={e=>setNotes({...notes,tests:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Advice"
                  value={notes.generalAdvice} onChange={e=>setNotes({...notes,generalAdvice:e.target.value})}/>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button className="btn btn-primary px-6" onClick={savePrescription}>
          Save & View
        </button>
      </div>
    </div>
  );
};
