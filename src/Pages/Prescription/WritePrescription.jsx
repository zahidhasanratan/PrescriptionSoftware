// src/Pages/Prescription/WritePrescription.jsx
import React, { useEffect, useState } from "react";
import axios  from "axios";
import Swal   from "sweetalert2";
import {
  Plus, Trash2, UserPlus, Paperclip, Eye,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/* ------------------------------------------------------------ */
export const WritePrescription = () => {
  const navigate   = useNavigate();
  const location   = useLocation();

  /* ---- state forwarded from Reports page (may be empty) ---- */
  const {
    patientId        : incomingPatientId,
    forwardedReports = [],           // [{ url, name, reportDate }]
  } = location.state || {};

  /* ---------------- Patient ---------------- */
  const [patients, setPatients]        = useState([]);
  const [searchQuery, setSearchQuery]  = useState("");
  const [showDropdown, setShowDropdown]= useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientForm, setPatientForm]  = useState({ name:"", age:"", gender:"", phone:"" });

  /* ---------------- Reports ---------------- */
  const [dbReports, setDbReports] = useState([]);   // [{ url,name,reportDate }]

  /* ---------------- Medicine ---------------- */
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicineInput, setMedicineInput] = useState({
    name:"", type:"", strength:"", dosage:"", advice:"", duration:"7 days",
  });
  const [suggestions, setSuggestions]   = useState({});
  const [highlighted, setHighlighted]   = useState({});
  const [addedMedicines, setAddedMedicines] = useState([]);

  /* ---------------- Notes ---------------- */
  const [notes, setNotes] = useState({ symptoms:"", tests:"", generalAdvice:"" });

  /* =============================================================
     Load patients & medicines once
  ============================================================= */
  useEffect(() => {
    axios.get("https://prescription-ebon.vercel.app/api/patients")
         .then(r=>setPatients(r.data))
         .catch(()=>Swal.fire("Error","Failed to load patients","error"));

    axios.get("https://prescription-ebon.vercel.app/api/medicines")
         .then(r=>setAllMedicines(r.data))
         .catch(()=>Swal.fire("Error","Failed to load medicines","error"));
  }, []);

  /* =============================================================
     Auto-select patient passed via navigation (if any)
  ============================================================= */
  useEffect(() => {
    if (!patients.length || !incomingPatientId) return;
    const p = patients.find(pt=>pt.patientId===incomingPatientId);
    if (p) handleSelectPatient(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients, incomingPatientId]);

  /* =============================================================
     Fetch this patient’s reports from DB
  ============================================================= */
  useEffect(() => {
    if (!selectedPatient) { setDbReports([]); return; }
    axios.get("https://prescription-ebon.vercel.app/api/reports", {
      params:{ patientId:selectedPatient.patientId }
    })
    .then(({data})=> setDbReports(
      data.map(r=>({ url:r.url, name:r.name, reportDate:r.reportDate||r.createdAt }))
    ))
    .catch(()=>setDbReports([]));
  }, [selectedPatient]);

  /* ---------- merge forwarded + DB, de-dup by URL ---------- */
  const combinedReports = React.useMemo(() => {
    const map = new Map();
    [...forwardedReports, ...dbReports].forEach(r=>{
      if (!map.has(r.url))
        map.set(r.url,{ url:r.url, name:r.name||"Report", reportDate:r.reportDate||"" });
    });
    return [...map.values()].sort(
      (a,b)=> new Date(b.reportDate||b.name) - new Date(a.reportDate||a.name)
    );
  }, [forwardedReports, dbReports]);

  /* =============================================================
     PATIENT helpers
  ============================================================= */
  const handlePatientSearch = e => { setSearchQuery(e.target.value); setShowDropdown(true); };

  const handleSelectPatient = p => {
    setSelectedPatient(p);
    setPatientForm(p);
    setSearchQuery(`${p.name} — ${p.phone}`);
    setShowDropdown(false);
  };

  const createPatientIfNeeded = async () => {
    if (selectedPatient) return selectedPatient;
    if (!patientForm.name)
      return Swal.fire("Required","Patient name is required","warning").then(()=>null);

    try{
      const payload = { ...patientForm, patientId:Date.now().toString() };
      const { data } = await axios.post("https://prescription-ebon.vercel.app/api/patients",payload);
      setPatients(p=>[...p,data]);
      setSelectedPatient(data);
      Swal.fire("Success","Patient added","success");
      return data;
    }catch{
      Swal.fire("Error","Failed to save patient","error");
      return null;
    }
  };

  /* =============================================================
     MEDICINE autocomplete helpers
  ============================================================= */
  const staticDict = {
    type:["Tablet","Capsule","Injection","Syrup"],
    strength:["500mg","250mg","1 spoon","2 spoons","1/2 spoon"],
    dosage:["1+0+1","1+1+1","0+1+0","1+0+0","0+0+1"],
    advice:["Before Meal","After Meal","With Water"],
  };

  const buildSuggestions = (field,val) => {
    const pool=new Set(staticDict[field]||[]);
    allMedicines.forEach(m=>{
      if(field==="name") pool.add(m.name);
      if(field==="type") m.types?.forEach(t=>pool.add(t));
      if(field==="strength") m.commonStrengths?.forEach(s=>pool.add(s));
      if(field==="dosage" && m.defaultDosage) pool.add(m.defaultDosage);
      if(field==="advice" && m.usageAdvice)   pool.add(m.usageAdvice);
    });
    const list=[...pool].filter(v=>v.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(s=>({...s,[field]:list}));
    setHighlighted(h=>({...h,[field]:0}));
  };

  const autofillFromName = name => {
    const m = allMedicines.find(x=>x.name===name);
    if(!m) return;
    setMedicineInput({
      name:m.name, type:m.types?.[0]||"", strength:m.commonStrengths?.[0]||"",
      dosage:m.defaultDosage||"", advice:m.usageAdvice||"", duration:"7 days",
    });
  };

  const handleMedChange = e => {
    const { name,value } = e.target;
    setMedicineInput(p=>({...p,[name]:value}));
    if(["name","type","strength","dosage","advice"].includes(name))
      buildSuggestions(name,value);
  };

  const handleMedKeyDown = (e,field) => {
    const list=suggestions[field]||[];
    if(!list.length) return;
    if(e.key==="ArrowDown"){e.preventDefault();setHighlighted(h=>({...h,[field]:(h[field]+1)%list.length}));}
    if(e.key==="ArrowUp"){e.preventDefault();setHighlighted(h=>({...h,[field]:(h[field]-1+list.length)%list.length}));}
    if(e.key==="Enter"){
      e.preventDefault();
      const choice=list[highlighted[field]];
      setMedicineInput(p=>({...p,[field]:choice}));
      setSuggestions(s=>({...s,[field]:[]}));
      if(field==="name") autofillFromName(choice);
    }
  };

  /* ---------- MED list ---------- */
  const addMedicine = () => {
    if(!medicineInput.name || !medicineInput.dosage) return;
    setAddedMedicines(arr=>[...arr,medicineInput]);
    setMedicineInput({ name:"", type:"", strength:"", dosage:"", advice:"", duration:"7 days" });
  };
  const removeMedicine = idx => setAddedMedicines(arr=>arr.filter((_,i)=>i!==idx));

  /* =============================================================
     Report viewer with disabled Prev / Next buttons + close “×”
  ============================================================= */
  const viewReports = () => {
    if(!combinedReports.length) return;
    const show = (index) => {
      const r = combinedReports[index];
      const dateTxt = r.reportDate
        ? new Date(r.reportDate).toLocaleDateString()
        : "Unknown date";

      Swal.fire({
        title: `${r.name} — ${dateTxt}`,
        html:  `<div style="display:flex;justify-content:center">
                  <img src="${r.url}" style="max-height:70vh;object-fit:contain"/>
                </div>`,
        showCloseButton: true,         // ← the “×”
        showConfirmButton: true,       // Next →
        showDenyButton: true,          // ← Prev
        confirmButtonText: "Next →",
        denyButtonText: "← Prev",
        allowOutsideClick: false,
        width: "60rem",
        didOpen: () => {
          if (index === 0)
            Swal.getDenyButton().disabled = true;
          if (index === combinedReports.length - 1)
            Swal.getConfirmButton().disabled = true;
        },
      }).then((res) => {
        if (res.isConfirmed && index < combinedReports.length - 1) show(index + 1);
        else if (res.isDenied && index > 0)                       show(index - 1);
      });
    };
    show(0);
  };

  /* ---------- SAVE ---------- */
  const savePrescription = async () => {
    if(!addedMedicines.length)
      return Swal.fire("Missing","No medicines added","warning");

    const patientDoc = await createPatientIfNeeded();
    if(!patientDoc) return;

    const payload = {
      patient:{
        name:patientDoc.name,
        age: patientDoc.age,
        gender:patientDoc.gender,
        phone:patientDoc.phone,
        patientId:patientDoc.patientId,
      },
      medicines:addedMedicines,
      notes,
      attachedReports:combinedReports,
    };

    try{
      const { data } = await axios.post("https://prescription-ebon.vercel.app/api/prescriptions",payload);
      await Swal.fire("Saved","Prescription saved!","success");
      navigate(`/prescriptions/${data._id}`);
    }catch(err){
      console.error(err);
      Swal.fire("Error","Failed to save prescription","error");
    }
  };

  /* ==================== UI ==================== */
  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-6">

      {/* -------- Banner if any reports -------- */}
      {combinedReports.length>0 && (
        <div className="alert alert-info flex items-center gap-3">
          <Paperclip size={18}/>
          <span>
            {combinedReports.length} report{combinedReports.length>1?"s":""} attached
          </span>
          <button className="btn btn-xs btn-outline" onClick={viewReports}>
            <Eye size={14}/> View
          </button>
        </div>
      )}

      {/* =============== Patient Section =============== */}
      <div className="space-y-4">
        <div className="relative">
          <label className="font-semibold block mb-1">Search Patient</label>
          <input
            className="input input-bordered w-full"
            placeholder="Name, Phone, or Patient ID"
            autoComplete="off"
            value={searchQuery}
            onChange={handlePatientSearch}
          />
          {showDropdown && (
            <ul className="absolute z-10 bg-white border shadow w-full max-h-40 overflow-y-auto rounded mt-1">
              {patients
                .filter(p=>[p.name,p.phone,p.patientId].join(" ").toLowerCase()
                   .includes(searchQuery.toLowerCase()))
                .map(p=>(
                  <li key={p._id}
                      className="px-4 py-2 hover:bg-teal-100 cursor-pointer"
                      onClick={()=>handleSelectPatient(p)}>
                    {p.name} — {p.phone}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Editable patient inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="input input-bordered w-full" autoComplete="off"
                 placeholder="Name"
                 value={patientForm.name}
                 onChange={e=>setPatientForm({...patientForm,name:e.target.value})}/>
          <input className="input input-bordered w-full" type="number"
                 placeholder="Age"
                 value={patientForm.age}
                 onChange={e=>setPatientForm({...patientForm,age:e.target.value})}/>
          <select className="select select-bordered w-full"
                  value={patientForm.gender}
                  onChange={e=>setPatientForm({...patientForm,gender:e.target.value})}>
            <option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
          <input className="input input-bordered w-full" autoComplete="off"
                 placeholder="Phone"
                 value={patientForm.phone}
                 onChange={e=>setPatientForm({...patientForm,phone:e.target.value})}/>
        </div>

        {!selectedPatient && (
          <button className="btn btn-outline btn-success btn-sm mt-2"
                  onClick={createPatientIfNeeded}>
            <UserPlus size={16}/> Save New Patient
          </button>
        )}
      </div>

      {/* =============== Medicine Section =============== */}
      <div className="space-y-2">
        <label className="font-semibold block">Add Medicine</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["name","type","strength","dosage","advice","duration"].map(field=>(
            <div key={field} className="relative">
              <input
                name={field}
                className="input input-bordered w-full"
                autoComplete="off"
                placeholder={field[0].toUpperCase()+field.slice(1)}
                value={medicineInput[field]}
                onChange={handleMedChange}
                onKeyDown={e=>handleMedKeyDown(e,field)}
                onBlur={()=>field==="name" && autofillFromName(medicineInput.name)}
              />
              {suggestions[field]?.length>0 && (
                <ul className="absolute z-10 bg-white border shadow w-full max-h-40 overflow-y-auto rounded mt-1">
                  {suggestions[field].map((opt,i)=>(
                    <li key={opt+i}
                        className={`px-3 py-2 cursor-pointer ${highlighted[field]===i?"bg-teal-100":""}`}
                        onMouseDown={()=>{  /* prevent onBlur */
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

        <button className="btn btn-sm bg-teal-600 text-white mt-2"
                onClick={addMedicine}>
          <Plus size={16}/> Add Medicine
        </button>
      </div>

      {/* Medicine Preview */}
      {addedMedicines.length>0 && (
        <div className="bg-gray-50 border rounded p-4 space-y-2">
          <p className="font-medium text-gray-700">Added Medicines:</p>
          {addedMedicines.map((m,i)=>(
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded border">
              <div>
                <strong>{m.name}</strong> ({m.type}) {m.strength}<br/>
                <small>
                  Dosage: {m.dosage}, Duration: {m.duration}, Advice: {m.advice}
                </small>
              </div>
              <button className="text-red-600 hover:text-red-800"
                      onClick={()=>removeMedicine(i)}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Complaints"
                  value={notes.symptoms}
                  onChange={e=>setNotes({...notes,symptoms:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Diagnosis"
                  value={notes.tests}
                  onChange={e=>setNotes({...notes,tests:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Advice"
                  value={notes.generalAdvice}
                  onChange={e=>setNotes({...notes,generalAdvice:e.target.value})}/>
      </div>

      {/* Save */}
      <div className="flex justify-end mt-6">
        <button className="btn btn-primary px-6" onClick={savePrescription}>
          Save & View
        </button>
      </div>
    </div>
  );
};
