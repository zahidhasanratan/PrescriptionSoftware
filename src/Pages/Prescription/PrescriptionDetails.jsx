// src/Pages/Prescription/PrescriptionDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Printer } from "lucide-react";

/* ---------------------------------- API BASE ---------------------------------
 * 1) VITE_API_URL
 * 2) If running on localhost -> http://localhost:5000/api
 * 3) Fallback to prod -> https://prescription-ebon.vercel.app/api
 * --------------------------------------------------------------------------- */


    const API_BASE =
  (import.meta?.env?.VITE_API_URL && import.meta.env.VITE_API_URL.replace(/\/+$/, "")) ||
  "https://prescription-ebon.vercel.app/api";


/* ========== Print CSS ========== */
const css = `
@media print {
  @page { size: A4 portrait; margin: 18mm 14mm 14mm 14mm; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body * { visibility: hidden !important; }
  #print-sheet, #print-sheet * { visibility: visible !important; }
  #print-sheet { position: absolute; inset: 0; width: 100%; display: flex; flex-direction: column; }
  .no-print { display: none !important; }
  .vertical-line { border-right: 2px solid #999 !important; }
}
`;

export function PrescriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rx, setRx] = useState(null);
  const [st, setSt] = useState({});
  const [catalog, setCatalog] = useState([]); // <-- complaints catalog
  const [ui, setUi] = useState("loading");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [rxRes, stRes, catRes] = await Promise.all([
          axios.get(`${API_BASE}/prescriptions/${id}`),
          axios.get(`${API_BASE}/settings`),
          axios.get(`${API_BASE}/complaints`), // fetch catalog to infer categories
        ]);
        if (!cancel) {
          setRx(rxRes.data);
          setSt(stRes.data || {});
          setCatalog(Array.isArray(catRes.data) ? catRes.data : []);
          setUi("ready");
        }
      } catch (e) {
        console.error(e);
        if (!cancel) {
          setErrMsg(e?.response?.data?.message || e.message || "Unknown error");
          setUi("error");
        }
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  // Group the plain-string complaints by matching to catalog details (case-insensitive)
  const groupedComplaints = useMemo(() => {
    if (!rx?.complaints || !Array.isArray(rx.complaints) || rx.complaints.length === 0) return null;

    const groups = new Map(); // catName -> string[]
    const otherKey = "Other";

    rx.complaints.forEach((c) => {
      const raw = (c || "").trim();
      const needle = raw.toLowerCase();
      if (!needle) return;

      let matchedCat = null;

      for (const cat of catalog) {
        const details = Array.isArray(cat?.details) ? cat.details : [];
        const foundIdx = details.findIndex(
          (d) => (d || "").trim().toLowerCase() === needle
        );
        if (foundIdx >= 0) {
          matchedCat = cat.name || "Category";
          break;
        }
      }

      const key = matchedCat || otherKey;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(raw);
    });

    // if only "Other" exists and equals all complaints, we can just return null to let fallback render
    if (groups.size === 1 && groups.has("Other")) {
      return groups; // still keep grouped view; remove this line to fallback to simple list
    }
    return groups;
  }, [rx?.complaints, catalog]);

  if (ui === "loading") return <p className="p-10 text-center">Loading…</p>;
  if (ui === "error")
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-600">Could not load prescription.</p>
        {errMsg && <p className="text-xs text-gray-500">{errMsg}</p>}
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  if (!rx) return null;

  const { patient, medicines = [], notes = {}, complaints = [], createdAt } = rx;
  const dash = (v) => (v ?? v === 0 ? v : "—");

  return (
    <>
      <style>{css}</style>

      <div
        id="print-sheet"
        className="max-w-4xl mx-auto bg-white shadow print:shadow-none relative pt-44 flex flex-col"
        style={{ minHeight: "19.6cm", fontFamily: "'Inter','Segoe UI','Roboto',sans-serif" }}
      >
        {/* Patient Info */}
        <div className="text-sm border-t border-b border-dashed border-gray-500 px-6 py-1 mb-2">
          <div className="grid grid-cols-4 gap-2">
            <div><b>Name:</b> {dash(patient?.name)}</div>
            <div><b>Age:</b> {dash(patient?.age)}</div>
            <div><b>Sex:</b> {dash(patient?.gender)}</div>
            <div><b>Date:</b> {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex px-6 mb-6">
          <aside className="w-1/3 pr-4 text-sm vertical-line">
            <h3 className="font-semibold mb-2">Complaints</h3>

            {/* If we could group by category, show grouped view; else fallback to simple bullets */}
            {Array.isArray(complaints) && complaints.length > 0 ? (
              groupedComplaints && groupedComplaints.size > 0 ? (
                <div className="space-y-2 mb-4">
                  {Array.from(groupedComplaints.entries()).map(([catName, items]) => (
                    <div key={catName}>
                      <div className="font-medium">{catName}</div>
                      <ul className="list-disc ml-5">
                        {items.map((txt, i) => <li key={catName + i}>{txt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="list-disc ml-5 mb-4">
                  {complaints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )
            ) : (
              <div className="italic text-gray-500 mb-4">No complaints listed.</div>
            )}

            {/* Additional notes (rich text) */}
            {notes?.symptoms && (
              <>
                <h3 className="font-semibold mb-2">Additional Complaints</h3>
                <div
                  className="whitespace-pre-wrap mb-4"
                  dangerouslySetInnerHTML={{ __html: notes.symptoms }}
                />
              </>
            )}

            {notes?.tests && (
              <>
                <h3 className="font-semibold mb-2">Tests to do</h3>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: notes.tests }}
                />
              </>
            )}
          </aside>

          <section className="w-2/3 pl-6 text-sm flex-grow">
            <h2 className="font-bold text-xl mb-4">
              R<span className="align-super text-xs">x</span>
            </h2>
            <div className="space-y-3 mb-6">
              {medicines.map((m, i) => (
                <div key={i}>
                  <b>{i + 1}.</b> <strong>{m.name}</strong>
                  {m.type && <em> ({m.type})</em>} {m.strength && <> {m.strength}</>}
                  <br />
                  {m.dosage && <>Dose: {m.dosage}&emsp;</>}
                  {m.duration && <>• Duration: {m.duration}&emsp;</>}
                  {m.advice && <>• {m.advice}</>}
                </div>
              ))}
            </div>

            {notes?.generalAdvice && (
              <>
                <h3 className="font-semibold mb-2">General Advice</h3>
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: notes.generalAdvice }}
                />
              </>
            )}
          </section>
        </div>

        {/* Signature */}
        <div className="mt-auto px-6 pb-6 text-right">
          <div className="border-t border-dotted border-gray-600 pt-1 w-40 ml-auto">
            Signature
          </div>
        </div>

        {/* Footer */}
        <footer className="text-xs px-6 flex justify-between">
          <div className="whitespace-pre-line leading-tight">
            <b>Days:</b> {dash(st.daysText)}{"\n"}
            <b>Timings:</b> {dash(st.timingText)}
          </div>
        </footer>

        {/* Auto-generated note */}
        <p className="text-[10px] text-center py-1" style={{
          fontFamily: "'Roboto Mono', monospace",
          color: "#444"
        }}>
          This prescription is computer-generated.
        </p>
      </div>

      {/* Screen-only actions */}
      <div className="no-print flex justify-end gap-3 p-4 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Back
        </button>
        <button onClick={() => window.print()} className="btn btn-primary btn-sm">
          <Printer size={14} /> Print
        </button>
      </div>
    </>
  );
}
