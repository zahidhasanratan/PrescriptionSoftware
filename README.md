# Smart Prescription App

> A full-stack prescription management system built for  
> Prof. Dr. Md. Anwarul Karim  
> (Website: [profkarimbsmmu.com](https://profkarimbsmmu.com/))

---

## 🚀 Live Software Link

[https://prescription.profkarimbsmmu.com/](https://prescription.profkarimbsmmu.com/)

---

## 🎯 Built For

This application was built specifically for Prof. Dr. Md. Anwarul Karim,  
Consultant Physician and Professor of Pediatric Hematology & Oncology at  
Bangabandhu Sheikh Mujib Medical University Hospital.

---

## 🔒 Login Restriction

Only allow-listed doctor emails may sign up or sign in (both Google OAuth and email/password).  
Any other user attempting to authenticate will be immediately signed out with an “Access denied” alert.

---

## ✍️ Key Feature

- **Write Prescription**  
  Create, save and print professional medical prescriptions—complete with letterhead, patient details, diagnosis, medicines, and advice.

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React + Vite  
- **Styling:** Tailwind CSS, DaisyUI  
- **Routing:** React Router  
- **HTTP:** Axios  
- **Notifications:** SweetAlert2  
- **Charts:** Recharts  
- **Icons:** Lucide-React, react-icons  
- **Auth:** Firebase Authentication (Google + Email/Password)  
- **Print + Download:** Browser print & html2canvas + jsPDF  
- **State:** React Context API  

### Backend

> _private repo: [PrescriptionServer](https://github.com/zahidhasanratan/PrescriptionServer)_

- **Runtime:** Node.js  
- **Framework:** Express  
- **Database:** MongoDB + Mongoose  
- **Auth:** Firebase Admin SDK (custom allow-list)  
- **File Storage:** imgBB (for report uploads)  
- **Env:** dotenv, CORS  

---

## 📋 Features

- **Patient Management**  
  Search, add, edit and delete patient records (Name, Age, Gender, Phone, Patient ID).
- **Medicine Master List**  
  CRUD operations on medicines with autocompletion for types, strengths, dosage, and advice.
- **Reports**  
  Upload, preview, download and delete medical reports (PDFs & images), grouped by date.
- **Write Prescription**  
  • Auto-select or add a new patient  
  • Add multiple medicines with suggestions  
  • Attach linked reports (optional)  
  • Enter symptoms, tests, general advice  
  • Print with professional letter-head and A4 layout  
  • Download as PDF  
- **History**  
  View past prescriptions with filters by patient and date range, export to CSV.
- **Doctor Settings**  
  Manage your profile (name, phone, specialization, clinic, address), practice days & timings, password change.
- **Dashboard**  
  Quick stats, performance charts (last 7 days & last 1 month), recent prescriptions, quick-add shortcuts.

---

## ⚙️ Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase project (for Auth)
- MongoDB connection (Atlas or local)
- imgBB API key (for report uploads)

