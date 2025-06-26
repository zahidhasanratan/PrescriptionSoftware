// src/routes/router.jsx
import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Root } from "../Pages/Root/Root";
import { Home } from "../Pages/Home/Home";
import { ErrorPage } from "../Pages/ErrorPage";
import { Login } from "../Pages/Login/Login";
import { Register } from "../Pages/Register/Register";
import PrivateRoute from "./PrivateRoute";
import { Loader } from "../Components/Loader";
import { PageWithTitle } from "../Components/PageWithTitle";
import { Patient } from "../Pages/Patient/Patient";
import { Prescription } from "../Pages/Prescription/Prescription";
import { WritePrescription } from "../Pages/Prescription/WritePrescription";
import { Reports } from "../Pages/Reports/Reports";
import { PrescriptionHistory } from "../Pages/History/PrescriptionHistory";
import { ViewPrescription } from "../Pages/History/ViewPrescription";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <PageWithTitle title="Prescription Software – Dashboard">
              <Home />
            </PageWithTitle>
          </Suspense>
        ),
      },
      {
        path: "/patients",
        element: (
          <PageWithTitle title="Manage Patients">
            <Patient />
          </PageWithTitle>
        ),
      },
      {
        path: "/prescriptions",
        element: (
          <PageWithTitle title="Manage Prescriptions">
            <Prescription />
          </PageWithTitle>
        ),
      },
 {
        path: "/prescriptions/write",
        element: (
          <PageWithTitle title="Write Prescriptions">
            <WritePrescription />
          </PageWithTitle>
        ),
      },
      
      {
        path: "/reports",
        element: (
          <PageWithTitle title="Medical Reports">
            <Reports />
          </PageWithTitle>
        ),
      },
      {
        path: "/history",
        element: (
          <PageWithTitle title="Prescription History">
            <PrescriptionHistory />
          </PageWithTitle>
        ),
      },
      {
        path: "/historyView/:id",
        element: (
          <PageWithTitle title="View Prescription">
            <ViewPrescription />
          </PageWithTitle>
        ),
      },
      {
        path: "/medicines",
        element: (
          <PageWithTitle title="Master Medicine List">
            <div>Medicine List Page (Coming Soon)</div>
          </PageWithTitle>
        ),
      },
      {
        path: "/settings",
        element: (
          <PageWithTitle title="Doctor Settings">
            <div>Settings Page (Coming Soon)</div>
          </PageWithTitle>
        ),
      },
      {
        path: "/help",
        element: (
          <PageWithTitle title="Support & Help">
            <div>Help Page (Coming Soon)</div>
          </PageWithTitle>
        ),
      },
      {
        path: "/login",
        element: (
          <PageWithTitle title="Login">
            <Login />
          </PageWithTitle>
        ),
      },
      {
        path: "/register",
        element: (
          <PageWithTitle title="Register">
            <Register />
          </PageWithTitle>
        ),
      },
    ],
  },
]);
