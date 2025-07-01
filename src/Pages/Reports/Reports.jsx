import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Folder,
  Search,
  Upload,
  Trash2,
  Download,
  Image,
} from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// ─────────────────────────────────────────────────────────── Constants
const IMGBB_KEY = import.meta.env.VITE_IMGBB_KEY;
const IMGBB_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`;
const MySwal = withReactContent(Swal);

// ─────────────────────────────────────── Searchable dropdown (patient)
function SearchableDropdown({ options, selected, onChange, placeholder, optionLabel = (o) => o }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const visible = options.filter((o) =>
    `${o.name} ${o.phone} ${o.patientId}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative" ref={boxRef}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between rounded border px-3 py-2 bg-white">
        <span>{selected ? optionLabel(selected) : placeholder}</span>
        <Search size={18} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded border bg-white shadow">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search..." className="w-full border-b px-3 py-2 outline-none" autoFocus />
          <ul className="max-h-60 overflow-auto">
            {visible.length ? (
              visible.map((o) => (
                <li key={o.patientId} className={`px-3 py-2 cursor-pointer hover:bg-teal-100 ${selected?.patientId === o.patientId ? "bg-teal-200 font-semibold" : ""}`} onClick={() => { onChange(o); setOpen(false); setFilter(""); }}>
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
}

// ──────────────────────────────────────────────── Main component
function Reports() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // fetch patients once
  useEffect(() => { axios.get("http://localhost:5000/api/patients").then(({ data }) => setPatients(data)); }, []);

  // fetch reports when patient changes
  useEffect(() => {
    if (!selectedPatient) return setReports([]);
    setLoading(true);
    axios.get("http://localhost:5000/api/reports", { params: { patientId: selectedPatient.patientId } })
      .then(({ data }) => setReports(data.sort((a,b)=> new Date(b.reportDate)-new Date(a.reportDate))))
      .finally(() => setLoading(false));
  }, [selectedPatient]);

  // ───── queue helpers
  const addFiles = (files) => {
    const arr = Array.from(files).map((f) => ({ id: crypto.randomUUID(), file: f, reportName: f.name.replace(/\.[^/.]+$/, ""), reportDate: new Date().toISOString().split("T")[0] }));
    setQueue((q) => [...q, ...arr]);
    fileRef.current.value = "";
  };
  const renameFile = (id, n) => setQueue((q) => q.map((f) => f.id === id ? { ...f, reportName: n } : f));
  const changeDate = (id, d) => setQueue((q) => q.map((f) => f.id === id ? { ...f, reportDate: d } : f));
  const removeQueued = (id) => setQueue((q) => q.filter((f) => f.id !== id));

  // ───── upload
  const handleUpload = async () => {
    if (!selectedPatient) return Swal.fire("Select patient first");
    if (!queue.length) return Swal.fire("No files selected");
    setUploading(true);
    try {
      for (const item of queue) {
        const fd = new FormData(); fd.append("image", item.file); fd.append("name", item.reportName);
        const { data:{data:{url}} } = await axios.post(IMGBB_URL, fd);
        const payload = { patientId: selectedPatient.patientId, name: item.reportName, url, reportDate: item.reportDate };
        const { data } = await axios.post("http://localhost:5000/api/reports", payload);
        setReports(r => [data, ...r].sort((a,b)=> new Date(b.reportDate)-new Date(a.reportDate)));
      }
      setQueue([]); Swal.fire({ icon:"success", title:"Uploaded" });
    } catch(e){ console.error(e); Swal.fire({ icon:"error", title:"Upload failed" }); } finally { setUploading(false);} };

  // ───── delete
  const deleteReport = async (id) => { const res = await Swal.fire({ title:"Delete this report?", icon:"warning", showCancelButton:true }); if(!res.isConfirmed) return; await axios.delete(`http://localhost:5000/api/reports/${id}`); setReports(r=> r.filter(rep=> rep._id!==id)); Swal.fire("Deleted", "","success"); };

  // ───── preview
  const preview=(idx)=>{ const show=i=>{ const r=reports[i]; Swal.fire({ title:r.name, html:`<div style="display:flex;justify-content:center"><img src="${r.url}" style="max-height:70vh;object-fit:contain"/></div>`, showCloseButton:true, showCancelButton:i>0, showConfirmButton:i<reports.length-1, cancelButtonText:"← Prev", confirmButtonText:"Next →", width:"60rem"}).then(res=>{ if(res.isDismissed) return; if(res.isConfirmed && i<reports.length-1) show(i+1); if(res.dismiss===Swal.DismissReason.cancel) show(i-1);});}; show(idx);} ;

  // ───── helper to group by date (YYYY‑MM‑DD)
  const grouped = reports.reduce((acc, r) => { const key = r.reportDate.split("T")[0]; (acc[key]=acc[key]||[]).push(r); return acc;}, {});
  const orderedDates = Object.keys(grouped).sort((a,b)=> new Date(b)-new Date(a));

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto space-y-6">
      <header className="flex items-center gap-3"><Folder size={26} className="text-teal-600"/><h2 className="text-2xl font-semibold text-teal-800">Medical Reports</h2></header>

      <div className="max-w-sm"><label className="block mb-1 font-medium">Select Patient</label><SearchableDropdown options={patients} selected={selectedPatient} onChange={setSelectedPatient} placeholder="Search by name, phone or ID" optionLabel={(p)=>`${p.name} — ${p.patientId}`} /></div>

      {selectedPatient && (<>
        <input ref={fileRef} type="file" multiple accept=".pdf,image/*" onChange={e=>addFiles(e.target.files)} className="file-input file-input-bordered w-full" disabled={uploading}/>

        {queue.length>0 && (<div className="mt-4 border rounded p-4 bg-gray-50"><h4 className="font-semibold mb-3 text-teal-700">Files to upload</h4><ul className="max-h-60 overflow-auto space-y-2">{queue.map(q=>(<li key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2 rounded"><input className="input input-bordered flex-grow" value={q.reportName} onChange={e=>renameFile(q.id,e.target.value)}/><input type="date" className="input input-bordered" value={q.reportDate} onChange={e=>changeDate(q.id,e.target.value)}/><button className="text-red-600 hover:text-red-800" onClick={()=>removeQueued(q.id)}><Trash2 size={16}/></button></li>))}</ul><button className="btn bg-teal-600 text-white mt-4" onClick={handleUpload} disabled={uploading}><Upload size={18} className="mr-1"/>{uploading?"Uploading…":"Upload"}</button></div>)}

        {loading ? (<p className="text-center py-8 text-gray-500">Loading…</p>) : reports.length ? (
          <div className="space-y-6">
            {orderedDates.map(date=>(<div key={date}><h3 className="font-semibold text-teal-700 mb-2">{new Date(date).toLocaleDateString()}</h3><div className="overflow-x-auto"><table className="w-full table-auto text-sm border-collapse"><thead className="bg-teal-100"><tr><th className="border px-4 py-2 text-left">Preview</th><th className="border px-4 py-2 text-left">Report</th><th className="border px-4 py-2 text-center">Actions</th></tr></thead><tbody>{grouped[date].map((r,idx)=>(<tr key={r._id} className="hover:bg-teal-50"><td className="border px-4 py-2">{r.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)?(<img src={r.url} alt="thumb" className="w-16 h-16 object-cover rounded"/>):(<Image size={18} className="text-gray-400"/>)}</td><td className="border px-4 py-2">{r.name}</td><td className="border px-4 py-2 text-center space-x-2"><button className="btn btn-xs bg-teal-600 text-white" onClick={()=>preview(reports.findIndex(rep=>rep._id===r._id))}><Download size={14} className="mr-1"/>View</button><button className="btn btn-xs bg-red-600 text-white" onClick={()=>deleteReport(r._id)}><Trash2 size={14} className="mr-1"/>Delete</button></td></tr>))}</tbody></table></div></div>))}
          </div>) : (<p className="text-gray-500">No reports found.</p>)}
      </>) }
    </div>);
}

export default Reports;
export { Reports };
