import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Root } from "../Pages/Root/Root";
import { Home } from "../Pages/Home/Home";
import { ErrorPage } from "../Pages/ErrorPage";
import { Loader } from "../Components/Loader";
import { Login } from "../Pages/Login/Login";
import { Register } from "../Pages/Register/Register";

import PrivateRoute from "./PrivateRoute";


import { PageWithTitle } from "../Components/PageWithTitle";


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
            <PageWithTitle title="Presctiption Software - Home">
              <Home />
            </PageWithTitle>
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <PageWithTitle title="Presctiption Software - Register">
            <Register />
          </PageWithTitle>
        ),
      },
      {
        path: "/login",
        element: (
          <PageWithTitle title="Presctiption Software - Login">
            <Login />
          </PageWithTitle>
        ),
      },
      
    
    
   
    ],
  },
]);
