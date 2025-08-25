// src/Pages/Patient/AddPatient.jsx
import React, { useState } from "react";
import { useNavigate }      from "react-router-dom";
import Swal                from "sweetalert2";

export const AddPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    category: "",             // ← new
  });

  const categories = [
    "G6PD",
    "Hemophilia",
    "HS",
    "CML",
    "COT",
    "CCS",
    "Thalassemia",
  ];

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, age, phone, category } = formData;

    // Basic validation
    if (!name || !age || !phone || !category) {
      return Swal.fire(
        "Validation Error",
        "Please fill in all required fields, including Category.",
        "warning"
      );
    }

    const newPatient = {
      ...formData,
      age: parseInt(age, 10),
      // generate a unique ID—prefix with `P`
      patientId: `P${Date.now()}`,
    };

    try {
      const res = await fetch("https://prescription-ebon.vercel.app/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add patient");
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
          type="text"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
          min={0}
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="select select-bordered w-full"
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

        {/* ← Category dropdown */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button className="btn btn-primary w-full" type="submit">
          Save Patient
        </button>
      </form>
    </div>
  );
};
