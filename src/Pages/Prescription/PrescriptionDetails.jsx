import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeft, Printer } from "lucide-react";

/* A4-ish printable container width */
const pageStyle =
  "@media print { @page { size: A4 portrait; margin: 14mm } body { -webkit-print-color-adjust: exact } }";

export const PrescriptionDetails = () => {
  const { id } = useParams();                 // /prescriptions/:id
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading]               = useState(true);

  /* fetch once */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/prescriptions/${id}`)
      .then((res) => setPrescription(res.data))
      .catch(() =>
        Swal.fire("Error", "Failed to load prescription.", "error").then(() =>
          navigate("/prescriptions")                   // fallback list page
        )
      )
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handlePrint = () => window.print();

  if (loading) return <p className="p-8 text-center">Loading…</p>;
  if (!prescription) return null;

  const { patient, medicines, notes, createdAt } = prescription;

  return (
    <>
      {/* print css */}
      <style>{pageStyle}</style>

      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded p-6 space-y-6"
           ref={printRef}>

        {/* header / clinic info */}
        <header className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-teal-700">Dr. John Doe</h1>
          <p className="text-sm">MBBS, FCPS (Medicine)</p>
          <p className="text-sm text-gray-600">123 Main St, City • Phone +880 1XXXXXXXXX</p>
        </header>

        {/* patient  */}
        <section className="flex justify-between text-sm">
          <div>
            <p><strong>Name:</strong> {patient.name}</p>
            {patient.patientId && <p><strong>ID:</strong> {patient.patientId}</p>}
            {patient.phone &&    <p><strong>Phone:</strong> {patient.phone}</p>}
          </div>
          <div className="text-right">
            {patient.gender && <p><strong>Gender:</strong> {patient.gender}</p>}
            {patient.age &&     <p><strong>Age:</strong> {patient.age}</p>}
            <p><strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </section>

        {/* Rᵡ – medicines */}
        <section>
          <h2 className="font-semibold mb-2">R<span className="align-super text-xs">x</span></h2>
          <table className="w-full text-sm border-t">
            <tbody>
              {medicines.map((m, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">
                    <strong>{idx + 1}. {m.name}</strong>{" "}
                    {m.type && <em>({m.type})</em>}{" "}
                    {m.strength && m.strength}
                  </td>
                  <td className="py-1">
                    {m.dosage && <>Dose:&nbsp;{m.dosage}&nbsp;</>}
                    {m.duration && <>•&nbsp;Duration:&nbsp;{m.duration}&nbsp;</>}
                    {m.advice && <>•&nbsp;{m.advice}</>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* notes */}
        {(notes?.symptoms || notes?.tests || notes?.generalAdvice) && (
          <section className="text-sm space-y-1">
            {notes.symptoms      && <p><strong>Symptoms:</strong> {notes.symptoms}</p>}
            {notes.tests         && <p><strong>Tests:</strong> {notes.tests}</p>}
            {notes.generalAdvice && <p><strong>Advice:</strong> {notes.generalAdvice}</p>}
          </section>
        )}

        {/* footer */}
        <footer className="border-t pt-4 text-right text-sm text-gray-500 print:hidden">
          <button className="btn btn-sm btn-outline mr-4" onClick={() => navigate(-1)}>
            <ArrowLeft size={14}/> Back
          </button>
          <button className="btn btn-sm btn-primary" onClick={handlePrint}>
            <Printer size={14}/> Print
          </button>
        </footer>
      </div>
    </>
  );
};
