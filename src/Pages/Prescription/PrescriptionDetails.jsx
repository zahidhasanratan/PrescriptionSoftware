// src/Pages/Prescription/PrescriptionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import axios                          from "axios";
import { ArrowLeft, Printer }         from "lucide-react";

/* ---------- print stylesheet ---------- */
const css = `
@media print {
  @page  { size:A4 portrait; margin:18mm 14mm 14mm 14mm; }
  body   { -webkit-print-color-adjust:exact; font-family:"Times New Roman",serif; }
  .no-print{display:none!important}
}
.brand-watermark{
  position:absolute; inset:0;
  font-size:6rem; letter-spacing:1rem;
  color:rgba(0,0,0,.04); font-weight:700;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none;
}
`;

function PrescriptionDetailsInner() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [doc, setDoc] = useState(null);
  const [state, setState] = useState/** `"loading" | "ready" | "error"` */("loading");

  useEffect(() => {
    let cancel = false;
    axios
      .get(`http://localhost:5000/api/prescriptions/${id}`)
      .then(({ data }) => !cancel && (setDoc(data), setState("ready")))
      .catch((err) => {
        console.error("Fetch error:", err?.response || err);
        if (!cancel) setState("error");
      });
    return () => { cancel = true };
  }, [id]);

  /* ---- UI states ---- */
  if (state === "loading") return <p className="p-10 text-center">Loading…</p>;
  if (state === "error")   return (
    <div className="p-10 text-center space-y-4">
      <p className="text-red-600">Could not load prescription.</p>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
        <ArrowLeft size={14}/> Go back
      </button>
    </div>
  );
  if (!doc) return null;                // should not happen

  const { patient, medicines, notes, createdAt } = doc;

  /* ---- Render printable sheet ---- */
  return (
    <>
      <style>{css}</style>

      <div className="max-w-4xl mx-auto bg-white shadow print:shadow-none relative overflow-hidden">
        <div className="brand-watermark">BRAND</div>

        {/* top bar */}
        <table className="w-full text-sm border-b">
          <tbody>
            <tr className="divide-x">
              <td className="p-1"><strong>Name:</strong> {patient?.name || "--"}</td>
              <td className="p-1 w-24"><strong>Age:</strong> {patient?.age || "--"}</td>
              <td className="p-1 w-28"><strong>Sex:</strong> {patient?.gender || "--"}</td>
              <td className="p-1 w-36"><strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>

        {/* grid */}
        <div className="grid" style={{ gridTemplateColumns:"26% 74%" , minHeight:"25cm" }}>

          {/* left column */}
          <aside className="relative bg-teal-50/60 p-4 text-sm border-r break-words">
            <h3 className="font-semibold mb-2">Diagnosis…</h3>

            {notes?.symptoms && (
              <p className="whitespace-pre-wrap mb-4">{notes.symptoms}</p>
            )}
            {notes?.tests && (
              <>
                <h4 className="font-semibold">Tests to do</h4>
                <p className="whitespace-pre-wrap mb-4">{notes.tests}</p>
              </>
            )}

            {/* static bottom hints */}
            <div className="absolute bottom-6 left-4 right-4 text-xs space-y-2">
              <div><b>Days:</b> MON, TUE, WED</div>
              <div><b>Timings:</b> In a huge setup of text that a reader be distracted</div>
            </div>
          </aside>

          {/* right column */}
          <section className="relative p-6 text-sm">
            <h2 className="font-bold text-xl mb-4">
              R<span className="align-super text-xs">x</span>
            </h2>

            <table className="w-full mb-8">
              <tbody>
                {medicines.map((m,i)=>(
                  <tr key={i} className="align-top">
                    <td className="pr-2">{i+1}.</td>
                    <td className="pb-2">
                      <strong>{m.name}</strong>
                      {m.type     && <em> ({m.type})</em>}
                      {m.strength && <> {m.strength}</>}
                      <br/>
                      {m.dosage   && <>Dose: {m.dosage}&ensp;</>}
                      {m.duration && <>• Duration: {m.duration}&ensp;</>}
                      {m.advice   && <>• {m.advice}</>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {notes?.generalAdvice && (
              <p className="text-sm">
                <b>General Advice:</b> {notes.generalAdvice}
              </p>
            )}

            {/* signature line */}
            <div className="absolute bottom-8 right-6 text-xs w-48 text-right">
              <div className="border-t border-dotted pt-1">Signature</div>
            </div>
          </section>
        </div>

        {/* action bar (hidden in print) */}
        <div className="no-print flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button onClick={()=>navigate(-1)} className="btn btn-outline btn-sm">
            <ArrowLeft size={14}/> Back
          </button>
          <button onClick={()=>window.print()} className="btn btn-primary btn-sm">
            <Printer size={14}/> Print
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Export both default + named so router can import either way        */
export { PrescriptionDetailsInner as PrescriptionDetails };
export default PrescriptionDetailsInner;
