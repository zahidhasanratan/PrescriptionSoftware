// src/Pages/Patient/AddPatient.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const AddPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.name || !formData.age || !formData.phone) {
      return Swal.fire("Validation Error", "Please fill in all required fields.", "warning");
    }

    const newPatient = {
      ...formData,
      age: parseInt(formData.age),
      patientId: `P${Date.now()}`, // Prefix for clarity (e.g., P171234567890)
    };

    try {
      const res = await fetch("https://prescription-ebon.vercel.app/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add patient");
      }

      Swal.fire("Success", "Patient added successfully!", "success");
      navigate("/patients");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">Add New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          name="age"
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
          min={0}
        />
        <select
          name="gender"
          className="select select-bordered w-full"
          value={formData.gender}
          onChange={handleChange}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <button className="btn btn-primary w-full" type="submit">
          Save Patient
        </button>
      </form>
    </div>
  );
};
