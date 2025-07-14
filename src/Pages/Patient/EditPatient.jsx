// src/Pages/Patient/EditPatient.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const EditPatient = () => {
  const { patientId } = useParams();
  const navigate      = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const categories = [
    "G6PD",
    "Hemophilia",
    "HS",
    "CML",
    "COT",
    "CCS",
    "Thalassemia",
  ];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch("https://prescription-ebon.vercel.app/api/patients");
        if (!res.ok) throw new Error("Failed to fetch patient data");
        const data = await res.json();

        const patient = data.find(p => p.patientId === patientId);
        if (!patient) throw new Error("Patient not found");

        setFormData({
          name:     patient.name     || "",
          age:      patient.age      || "",
          gender:   patient.gender   || "Male",
          phone:    patient.phone    || "",
          category: patient.category || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, age, phone, category } = formData;

    if (!name || !age || !phone || !category) {
      return Swal.fire("Warning", "All fields including Category are required.", "warning");
    }

    try {
      const res = await fetch(
        `https://prescription-ebon.vercel.app/api/patients/${patientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            age: parseInt(age, 10),
            gender: formData.gender,
            phone,
            category,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update patient");
      }

      Swal.fire("Success", "Patient updated successfully!", "success");
      navigate("/patients");
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  if (loading) return <p className="p-8 text-center">Loading patient data...</p>;
  if (error)   return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-teal-800">Edit Patient</h2>
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

        {/* Category dropdown */}
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
          Update Patient
        </button>
      </form>
    </div>
  );
};
