import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const tabs = [
  { id: "basic", label: "Basic Information" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "notes", label: "Medical Notes" },
  { id: "history", label: "Medical History" },
];

export const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");

  // Demo data for now
  const demoPatient = {
    patientId,
    name: "John Doe",
    age: 35,
    gender: "Male",
    phone: "+880123456789",
    email: "john.doe@example.com",
    address: "123 Garden St, Springfield",
    medicalHistory: [
      "Diabetes Type 2",
      "High Blood Pressure",
      "Allergy to Penicillin",
    ],
    prescriptions: [
      {
        id: "RX001",
        date: "2024-06-10",
        medication: "Metformin 500mg",
        notes: "Take twice daily after meals",
      },
      {
        id: "RX002",
        date: "2024-05-22",
        medication: "Lisinopril 10mg",
        notes: "Once daily",
      },
      {
        id: "RX003",
        date: "2024-03-10",
        medication: "Aspirin 75mg",
        notes: "Preventive therapy",
      },
    ],
    medicalNotes: [
      {
        date: "2024-06-12",
        note: "Patient reports feeling better, blood sugar levels improving.",
      },
      {
        date: "2024-05-25",
        note: "Monitor blood pressure, encourage low-sodium diet.",
      },
      {
        date: "2024-04-10",
        note: "Advised regular exercise and diet control.",
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg flex flex-col md:flex-row gap-6">
      {/* Sidebar Tabs */}
      <nav className="flex md:flex-col gap-2 md:w-48">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-teal-700 hover:text-teal-900 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Patients
        </button>

        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-4 rounded-md text-left transition-colors duration-200
              ${
                activeTab === id
                  ? "bg-teal-100 text-teal-900 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1">
        <h1 className="text-4xl font-bold mb-6 text-teal-900">
          Patient Details - {demoPatient.name}
        </h1>

        {activeTab === "basic" && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
            <div>
              <strong>Patient ID:</strong> {demoPatient.patientId}
            </div>
            <div>
              <strong>Name:</strong> {demoPatient.name}
            </div>
            <div>
              <strong>Age:</strong> {demoPatient.age}
            </div>
            <div>
              <strong>Gender:</strong> {demoPatient.gender}
            </div>
            <div>
              <strong>Phone:</strong> {demoPatient.phone}
            </div>
            <div>
              <strong>Email:</strong> {demoPatient.email}
            </div>
            <div className="sm:col-span-2">
              <strong>Address:</strong> {demoPatient.address}
            </div>
          </section>
        )}

        {activeTab === "prescriptions" && (
          <section>
            {demoPatient.prescriptions.length === 0 ? (
              <p className="text-gray-600">No prescriptions available.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {demoPatient.prescriptions.map((presc) => (
                  <div
                    key={presc.id}
                    className="border border-gray-300 rounded-md p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                  >
                    <div>
                      <p>
                        <strong>ID:</strong> {presc.id} | <strong>Date:</strong>{" "}
                        {presc.date}
                      </p>
                      <p>
                        <strong>Medication:</strong> {presc.medication}
                      </p>
                      <p>
                        <strong>Notes:</strong> {presc.notes}
                      </p>
                    </div>
                    <button
                      className="btn btn-sm btn-primary mt-4 sm:mt-0"
                      onClick={() =>
                        alert(
                          `Navigate to prescription details page for ${presc.id} (Coming soon!)`
                        )
                      }
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "notes" && (
          <section>
            {demoPatient.medicalNotes.length === 0 ? (
              <p className="text-gray-600">No medical notes available.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {demoPatient.medicalNotes.map((note, i) => (
                  <div
                    key={i}
                    className="border border-gray-300 rounded-md p-4 bg-gray-50"
                  >
                    <p className="text-sm text-gray-500">{note.date}</p>
                    <p>{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section>
            {demoPatient.medicalHistory.length === 0 ? (
              <p className="text-gray-600">No medical history available.</p>
            ) : (
              <ul className="list-disc list-inside text-gray-700 max-h-[400px] overflow-y-auto">
                {demoPatient.medicalHistory.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
