// src/Pages/Prescription/EditPrescription.jsx
import React, { useEffect, useState }   from "react";
import { useParams, useNavigate }       from "react-router-dom";
import axios                            from "axios";
import Swal                             from "sweetalert2";
import { Plus, Trash2 }                 from "lucide-react";

/* ───────────────────────────────────────────────────────────── */
export default function EditPrescription() {
  const { id } = useParams();                 // prescription _id
  const nav    = useNavigate();

  /* loading gate */
  const [loading, setLoading] = useState(true);

  /* ------------ form state ------------ */
  const [patient, setPatient]   = useState({ name:"", age:"", gender:"", phone:"", patientId:"" });
  const [meds,    setMeds]      = useState([]);

  /* live input for a medicine row  */
  const [medInput, setMedInput] = useState({ name:"", type:"", strength:"", dosage:"", advice:"", duration:"7 days" });

  /* note fields */
  const [notes, setNotes] = useState({ symptoms:"", tests:"", generalAdvice:"" });

  /* suggestions */
  const [allMeds, setAllMeds]   = useState([]);       // master list
  const [sugg,    setSugg]      = useState({});
  const [hi,      setHi]        = useState({});

  /* ------------ load doc + master data ------------ */
  useEffect(() => {
    Promise.all([
      axios.get(`https://prescription-ebon.vercel.app/api/prescriptions/${id}`),
      axios.get("https://prescription-ebon.vercel.app/api/medicines"),
    ])
    .then(([pDoc, medRes]) => {
      const d = pDoc.data;
      setPatient(d.patient);
      setMeds   (d.medicines);
      setNotes  (d.notes || {});
      setAllMeds(medRes.data);
    })
    .catch(() => Swal.fire("Error","Failed to load data","error").then(()=>nav("/prescriptions")))
    .finally(()=>setLoading(false));
  }, [id, nav]);

  /* ------------ suggestion helpers (same as writer) ------------ */
  const dict = {
    type:["Tablet","Capsule","Injection","Syrup"],
    strength:["500mg","250mg","1 spoon","2 spoons","1/2 spoon"],
    dosage:["1+0+1","1+1+1","0+1+0","1+0+0","0+0+1"],
    advice:["Before Meal","After Meal","With Water"]
  };

  const build = (field,val)=>{
    const set = new Set(dict[field]||[]);
    allMeds.forEach(m=>{
      if(field==="name")      set.add(m.name);
      if(field==="type")      m.types?.forEach(t=>set.add(t));
      if(field==="strength")  m.commonStrengths?.forEach(s=>set.add(s));
      if(field==="dosage" && m.defaultDosage) set.add(m.defaultDosage);
      if(field==="advice" && m.usageAdvice)   set.add(m.usageAdvice);
    });
    setSugg(p=>({...p,[field]:[...set].filter(v=>v.toLowerCase().includes(val.toLowerCase()))}));
    setHi  (p=>({...p,[field]:0}));
  };

  const autofill = name=>{
    const m=allMeds.find(x=>x.name===name);
    if(!m) return;
    setMedInput({
      name:m.name,
      type:m.types?.[0]||"",
      strength:m.commonStrengths?.[0]||"",
      dosage:m.defaultDosage||"",
      advice:m.usageAdvice||"",
      duration:"7 days"
    });
  };

  /* ------------ medicine field handlers ------------ */
  const onMedChange = e=>{
    const {name,value} = e.target;
    setMedInput(p=>({...p,[name]:value}));
    if(["name","type","strength","dosage","advice"].includes(name)) build(name,value);
  };

  const selectOption = (val,field)=>{
    setMedInput(p=>({...p,[field]:val}));
    setSugg(s=>({...s,[field]:[]}));
    if(field==="name") autofill(val);
  };

  const onKey = (e,field)=>{
    const lst=sugg[field] || [];
    if(!lst.length) return;
    if(e.key==="ArrowDown"){e.preventDefault();setHi(h=>({...h,[field]:(h[field]+1)%lst.length}));}
    if(e.key==="ArrowUp")  {e.preventDefault();setHi(h=>({...h,[field]:(h[field]-1+lst.length)%lst.length}));}
    if(e.key==="Enter")    {e.preventDefault();selectOption(lst[hi[field]],field);}
  };

  /* ------------ med list ops ------------ */
  const addMed = ()=>{
    if(!medInput.name||!medInput.dosage) return;
    setMeds(p=>[...p,medInput]);
    setMedInput({name:"",type:"",strength:"",dosage:"",advice:"",duration:"7 days"});
  };
  const removeMed = i=>setMeds(p=>p.filter((_,idx)=>idx!==i));

  /* ------------ update doc ------------ */
  const update = async()=>{
    if(!meds.length) return Swal.fire("Missing","Add at least one medicine","warning");
    try{
      await axios.put(`https://prescription-ebon.vercel.app/api/prescriptions/${id}`,{
        patient, medicines:meds, notes
      });
      await Swal.fire("Updated","Prescription updated","success");
      nav(`/prescriptions/${id}`);
    }catch(err){
      console.error(err);
      Swal.fire("Error","Update failed","error");
    }
  };

  /* ------------ render ------------ */
  if(loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white shadow p-6 rounded space-y-6">

      <h2 className="text-xl font-bold text-teal-700">Edit Prescription</h2>

      {/* -------- patient header (unchanged) -------- */}
      <div className="space-y-1 text-sm">
        <p><strong>{patient.name}</strong></p>
        <p className="text-gray-600">
          {patient.age && <>Age&nbsp;{patient.age},&nbsp;</>}
          {patient.gender && <>{patient.gender},&nbsp;</>}
          {patient.phone}
        </p>
      </div>

      {/* -------- medicine editor -------- */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {["name","type","strength","dosage","advice","duration"].map(f=>(
            <div key={f} className="relative">
              <input name={f} autoComplete="off"
                     className="input input-bordered w-full"
                     placeholder={f[0].toUpperCase()+f.slice(1)}
                     value={medInput[f]} onChange={onMedChange}
                     onKeyDown={e=>onKey(e,f)}
                     onBlur={()=>f==="name"&&autofill(medInput.name)}/>
              {sugg[f]?.length>0&&(
                <ul className="absolute z-10 w-full bg-white border shadow max-h-40 overflow-y-auto mt-1 rounded">
                  {sugg[f].map((op,i)=>(
                    <li key={op+i} onMouseDown={()=>selectOption(op,f)}
                        className={`px-3 py-1 cursor-pointer ${hi[f]===i?"bg-teal-100":""}`}>
                      {op}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-sm bg-teal-600 text-white" onClick={addMed}>
          <Plus size={16}/> Add / Update List
        </button>
      </div>

      {/* list */}
      {meds.map((m,i)=>(
        <div key={i} className="flex justify-between items-center bg-gray-50 border rounded p-2 text-sm">
          <span>
            <strong>{m.name}</strong> ({m.type}) {m.strength} – {m.dosage} • {m.duration} • {m.advice}
          </span>
          <button onClick={()=>removeMed(i)} className="text-red-600 hover:text-red-800">
            <Trash2 size={16}/>
          </button>
        </div>
      ))}

      {/* -------- notes (all three fields) -------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Complaints"
                  value={notes.symptoms||""}
                  onChange={e=>setNotes({...notes,symptoms:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Diagnosis"
                  value={notes.tests||""}
                  onChange={e=>setNotes({...notes,tests:e.target.value})}/>
        <textarea className="textarea textarea-bordered" rows={2} placeholder="Advice"
                  value={notes.generalAdvice||""}
                  onChange={e=>setNotes({...notes,generalAdvice:e.target.value})}/>
      </div>

      {/* action */}
      <div className="flex justify-end">
        <button className="btn btn-primary px-6" onClick={update}>
          Update &amp; View
        </button>
      </div>
    </div>
  );
}
