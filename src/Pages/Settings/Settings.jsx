import React, { useState, useRef } from "react";
import { Settings as SettingsIcon, UploadCloud } from "lucide-react";

export const Settings = () => {
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Dr. Zahid Hasan",
    phone: "017XXXXXXXX",
    specialization: "General Physician",
    clinicName: "City Health Clinic",
    clinicAddress: "123 Main Road, Dhaka",
  });

  const [signaturePreview, setSignaturePreview] = useState(null);
  const signatureInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignaturePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    alert("Settings updated successfully!");
    // In real app: Send to backend
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">Doctor Settings</h2>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Doctor Name</label>
          <input
            type="text"
            name="name"
            className="input input-bordered w-full"
            value={doctorInfo.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            className="input input-bordered w-full"
            value={doctorInfo.phone}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Specialization</label>
          <input
            type="text"
            name="specialization"
            className="input input-bordered w-full"
            value={doctorInfo.specialization}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Clinic Name</label>
          <input
            type="text"
            name="clinicName"
            className="input input-bordered w-full"
            value={doctorInfo.clinicName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Clinic Address</label>
          <textarea
            name="clinicAddress"
            rows={2}
            className="textarea textarea-bordered w-full"
            value={doctorInfo.clinicAddress}
            onChange={handleInputChange}
          />
        </div>

        {/* Signature Upload */}
        <div>
          <label className="block font-medium mb-1">Signature</label>
          <div className="flex items-center gap-4">
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
              className="file-input file-input-bordered"
            />
            {signaturePreview && (
              <img
                src={signaturePreview}
                alt="Signature Preview"
                className="h-12 border rounded shadow"
              />
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Save Settings
      </button>
    </div>
  );
};
