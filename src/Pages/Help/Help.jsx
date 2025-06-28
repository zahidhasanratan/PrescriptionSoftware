import React, { useState } from "react";
import {
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircleQuestion,
  Mail,
} from "lucide-react";

export const Help = () => {
  const [accordion, setAccordion] = useState({
    documentation: false,
    faq: false,
  });

  const toggleAccordion = (key) => {
    setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle size={28} className="text-teal-600" />
        <h2 className="text-3xl font-semibold text-teal-800">Support & Help</h2>
      </div>

      {/* Accordion Links */}
      <div className="space-y-3">
        {/* Documentation */}
        <div className="border border-teal-200 rounded-lg overflow-hidden">
          <div
            onClick={() => toggleAccordion("documentation")}
            className="flex items-center justify-between cursor-pointer bg-teal-50 px-4 py-3 hover:bg-teal-100 transition"
          >
            <div className="flex items-center gap-2 text-teal-800 font-medium">
              <BookOpen size={18} />
              View Documentation
            </div>
            {accordion.documentation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {accordion.documentation && (
            <div className="bg-white px-5 py-4 text-sm text-gray-700 space-y-2">
              <p><strong>How to Use:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create prescriptions using the "Write New" button.</li>
                <li>Manage your patients from the Patients section.</li>
                <li>Upload and organize reports by patient.</li>
                <li>Adjust preferences in Doctor Settings.</li>
              </ul>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="border border-teal-200 rounded-lg overflow-hidden">
          <div
            onClick={() => toggleAccordion("faq")}
            className="flex items-center justify-between cursor-pointer bg-teal-50 px-4 py-3 hover:bg-teal-100 transition"
          >
            <div className="flex items-center gap-2 text-teal-800 font-medium">
              <MessageCircleQuestion size={18} />
              Frequently Asked Questions
            </div>
            {accordion.faq ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {accordion.faq && (
            <div className="bg-white px-5 py-4 text-sm text-gray-700 space-y-3">
              <div>
                <p><strong>Q:</strong> Can I edit prescriptions later?</p>
                <p><strong>A:</strong> Yes, any created prescription can be edited anytime.</p>
              </div>
              <div>
                <p><strong>Q:</strong> How do I add a new patient?</p>
                <p><strong>A:</strong> While writing a prescription, toggle “Add New Patient”.</p>
              </div>
              <div>
                <p><strong>Q:</strong> How are reports stored?</p>
                <p><strong>A:</strong> Uploaded files are linked directly to patient profiles.</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Email */}
        <div className="flex items-center gap-2 text-gray-700 mt-4">
          <Mail size={18} className="text-teal-600" />
          <span>
            For further help, email us at{" "}
            <span className="text-teal-700 font-medium">support@esoft.com.bd</span>
          </span>
        </div>
      </div>
    </div>
  );
};
