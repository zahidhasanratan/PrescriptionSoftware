import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Printer } from "lucide-react";

/* ========== Print CSS ========== */
const css = `
@media print {
  @page { size: A4 portrait; margin: 18mm 14mm 14mm 14mm; }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  #print-sheet, #print-sheet * {
    visibility: visible !important;
  }

  #print-sheet {
    position: absolute;
    inset: 0;
    width: 100%;
  }

  .no-print {
    display: none !important;
  }

  .vertical-line {
    border-right: 2px solid #999 !important;
  }
}
`;

export function PrescriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rx, setRx] = useState(null);
  const [st, setSt] = useState({});
  const [ui, setUi] = useState("loading");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [rxRes, stRes] = await Promise.all([
          axios.get(`https://prescription-ebon.vercel.app/api/prescriptions/${id}`),
          axios.get("https://prescription-ebon.vercel.app/api/settings")
        ]);
        if (!cancel) {
          setRx(rxRes.data);
          setSt(stRes.data || {});
          setUi("ready");
        }
      } catch (e) {
        console.error(e);
        !cancel && setUi("error");
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (ui === "loading") return <p className="p-10 text-center">Loading…</p>;
  if (ui === "error") return (
    <div className="p-10 text-center space-y-4">
      <p className="text-red-600">Could not load prescription.</p>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
        <ArrowLeft size={14} /> Go back
      </button>
    </div>
  );
  if (!rx) return null;

  const { patient, medicines, notes, createdAt } = rx;
  const dash = v => v || "—";
  const nl2br = v => v?.split("\n").map((l, i) => <span key={i}>{l}<br /></span>);

  return (
    <>
      <style>{css}</style>

      <div
        id="print-sheet"
        className="max-w-4xl mx-auto bg-white shadow print:shadow-none relative flex flex-col"
        style={{
          minHeight: "25.6cm",
          fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif"
        }}
      >
        {/* Header */}
        <header className="pb-3 mb-2 px-6 pt-4">
          <div className="flex justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dash(st.name)}
              </h1>
              <p className="text-sm font-medium">{dash(st.specialization)}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{nl2br(st.designation)}</p>
            </div>
            <div className="text-right text-sm text-gray-700">
              <p><b>Chamber:</b><br />{dash(st.clinicName)}<br />{nl2br(st.clinicAddress)}</p>
              {st.phone && <p className="mt-1"><b>Phone:</b> {st.phone}</p>}
            </div>
          </div>
        </header>

        {/* Patient Info */}
        <div className="text-sm border-t border-b border-dashed border-gray-500 px-6 py-1 mb-2">
          <div className="grid grid-cols-4 gap-2">
            <div><b>Name:</b> {dash(patient?.name)}</div>
            <div><b>Age:</b> {dash(patient?.age)}</div>
            <div><b>Sex:</b> {dash(patient?.gender)}</div>
            <div><b>Date:</b> {new Date(createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex px-6">
          {/* Diagnosis */}
          <aside className="w-1/3 pr-4 text-sm vertical-line">
            <h3 className="font-semibold mb-2">Diagnosis</h3>
            {notes?.symptoms && (
              <p className="whitespace-pre-wrap mb-3">{notes.symptoms}</p>
            )}
            {notes?.tests && (
              <>
                <h4 className="font-semibold">Tests to do</h4>
                <p className="whitespace-pre-wrap">{notes.tests}</p>
              </>
            )}
          </aside>

          {/* Medicines */}
          <section className="w-2/3 pl-6 text-sm flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-xl mb-4">
                R<span className="align-super text-xs">x</span>
              </h2>
              <div className="space-y-3">
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
                <p className="mt-4 text-sm"><b>General Advice:</b> {notes.generalAdvice}</p>
              )}
            </div>

            {/* Signature */}
            <div className="text-right mt-12 pr-4" style={{ width: "100%" }}>
              <div className="border-t border-dotted border-gray-600 pt-1 w-40 float-right">
                Signature
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-4 pt-2 text-xs px-6 flex justify-between">
          <div className="whitespace-pre-line leading-tight">
            <b>Days:</b> {dash(st.daysText)}{"\n"}
            <b>Timings:</b> {dash(st.timingText)}
          </div>
        </footer>

        {/* Software Credit */}
        <p className="text-[10px] text-center py-1" style={{
          fontFamily: "'Roboto Mono', monospace",
          color: "#444"
        }}>
          Software Developed by: e-Soft
        </p>
      </div>

      {/* Screen-only Action Buttons */}
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
