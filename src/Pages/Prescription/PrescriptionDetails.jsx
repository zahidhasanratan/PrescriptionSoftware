// ── src/Pages/Prescription/PrescriptionDetails.jsx ──────────────────────────
import React, { useEffect, useState } from "react";
import { useParams, useNavigate }     from "react-router-dom";
import axios                          from "axios";
import { ArrowLeft, Printer }         from "lucide-react";

/* ═══════════  print-only css  ═══════════ */
const css = `
@media print {
  @page  { size:A4 portrait; margin:18mm 14mm 14mm 14mm }
  body   { -webkit-print-color-adjust:exact; font-family:"Times New Roman",serif }

  body *           { visibility:hidden !important }
  #print-sheet,
  #print-sheet *   { visibility:visible !important }
  #print-sheet     { position:absolute; inset:0; width:100% }

  .no-print        { display:none !important }
}
`;

export function PrescriptionDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [rx, setRx] = useState(null);      // prescription doc
  const [st, setSt] = useState({});        // doctor settings
  const [ui, setUi] = useState("loading"); // loading | ready | error

  /* ── fetch once ─────────────────────────────────────────── */
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

  /* ── guards ─────────────────────────────────────────────── */
  if (ui === "loading") return <p className="p-10 text-center">Loading…</p>;
  if (ui === "error")   return (
    <div className="p-10 text-center space-y-4">
      <p className="text-red-600">Could not load prescription.</p>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
        <ArrowLeft size={14}/> Go back
      </button>
    </div>
  );
  if (!rx) return null;

  const { patient, medicines, notes, createdAt } = rx;

  const dash  = v => v || "—";
  const nl2br = v => v?.split("\n").map((l,i)=><span key={i}>{l}<br/></span>);

  /* ── SHEET ──────────────────────────────────────────────── */
  return (
    <>
      <style>{css}</style>

      <div
        id="print-sheet"
        className="max-w-4xl mx-auto bg-white shadow print:shadow-none relative flex flex-col"
        style={{ minHeight: "26.3cm" }}                /* exact printable height */
      >
        {/* ═══════ Letter-head ═══════ */}
        <header className="border-b pb-3 mb-4 flex items-start gap-4">
          <div className="flex-1">
            <h1 className="font-extrabold text-xl md:text-2xl text-teal-800 leading-snug">
              {dash(st.name)}
            </h1>
            <p className="text-sm md:text-base font-medium text-gray-700">
              {dash(st.specialization)}
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {nl2br(st.designation)}
            </p>
          </div>

          <div className="text-right text-xs md:text-sm text-gray-700 leading-snug">
            <p>
              <b>Chamber:</b><br/>
              {dash(st.clinicName)}<br/>
              {nl2br(st.clinicAddress)}
            </p>
            {st.phone && <p className="mt-1"><b>Phone:</b> {st.phone}</p>}
          </div>
        </header>

        {/* ═══════ Patient strip ═══════ */}
        <table className="w-full text-sm border-b mb-4">
          <tbody>
            <tr className="divide-x">
              <td className="p-1"><b>Name:</b> {dash(patient?.name)}</td>
              <td className="p-1 w-24"><b>Age:</b> {dash(patient?.age)}</td>
              <td className="p-1 w-28"><b>Sex:</b> {dash(patient?.gender)}</td>
              <td className="p-1 w-40"><b>Date:</b> {new Date(createdAt).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>

        {/* ========= Main body (flex-grow) ========= */}
        <div className="flex-grow">
          <div className="grid" style={{ gridTemplateColumns:"26% 74%" }}>
            {/* left column */}
            <aside className="relative bg-teal-50/60 p-4 text-sm border-r break-words">
              <h3 className="font-semibold mb-2">Diagnosis…</h3>
              {notes?.symptoms && <p className="whitespace-pre-wrap mb-4">{notes.symptoms}</p>}
              {notes?.tests && (
                <>
                  <h4 className="font-semibold">Tests to do</h4>
                  <p className="whitespace-pre-wrap mb-4">{notes.tests}</p>
                </>
              )}
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
                <p className="text-sm"><b>General&nbsp;Advice:</b> {notes.generalAdvice}</p>
              )}
            </section>
          </div>
        </div>

        {/* ═══════ Footer (always bottom) ═══════ */}
        <footer className="border-t pt-2 mt-2 text-xs flex justify-between items-end">
          {/* days / timing */}
          <div className="whitespace-pre-line leading-snug">
            <b>Days:</b> {dash(st.daysText)}{"\n"}
            <b>Timings:</b> {dash(st.timingText)}
          </div>

          {/* signature */}
          <div className="text-right" style={{ width:"160px" }}>
            <div className="border-t border-dotted pt-1">Signature</div>
          </div>
        </footer>

        {/* tiny note */}
        <p className="text-[10px] text-center text-gray-500 py-2">
          This prescription is computer-generated.
        </p>
      </div>

      {/* action bar (screen-only) */}
      <div className="no-print flex justify-end gap-3 p-4 max-w-4xl mx-auto">
        <button onClick={()=>navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={14}/> Back
        </button>
        <button onClick={()=>window.print()} className="btn btn-primary btn-sm">
          <Printer size={14}/> Print
        </button>
      </div>
    </>
  );
}
