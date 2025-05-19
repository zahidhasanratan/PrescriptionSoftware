import React from "react";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Zoom } from "react-awesome-reveal";

export const Login = () => {
  const handleEmailLogin = (e) => {
    e.preventDefault();
    console.log("Login with email and password");
  };

  const handleGoogleLogin = () => {
    console.log("Login with Google");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <Zoom triggerOnce>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
            Login to Garden Hub
          </h2>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-800">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Login
            </button>
          </form>

          <div className="my-4 text-center text-sm text-gray-500">OR</div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-green-400 py-2 rounded hover:bg-green-100 transition"
          >
            <FaGoogle className="text-green-600" /> Login with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-green-700 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </Zoom>
    </section>
  );
};
