// src/routes/router.jsx
import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Root } from "../Pages/Root/Root";
import { PlainLayout } from "../layouts/PlainLayout"; // import your PlainLayout
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
import { Medicines } from "../Pages/Medicines/Medicines";
import { Settings } from "../Pages/Settings/Settings";
import { Help } from "../Pages/Help/Help";

export const router = createBrowserRouter([
  {
    element: <Root />,      // Main layout with sidebar/header/footer
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
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
            <Medicines />
          </PageWithTitle>
        ),
      },
      {
        path: "/settings",
        element: (
          <PageWithTitle title="Doctor Settings">
            <Settings />
          </PageWithTitle>
        ),
      },
      {
        path: "/help",
        element: (
          <PageWithTitle title="Support & Help">
            <Help />
          </PageWithTitle>
        ),
      },
    ],
  },
  {
    element: <PlainLayout />,   // Minimal layout for auth pages
    children: [
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
  {
    path: "*",
    element: <ErrorPage />, // catch-all 404 fallback
  },
]);
