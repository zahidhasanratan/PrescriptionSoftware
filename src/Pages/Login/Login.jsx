import React, { useState, useContext } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zoom } from "react-awesome-reveal";
import Swal from "sweetalert2";
import { AuthContext } from "../../Provider/AuthProvider"; // ✅ corrected import path

export const Login = () => {
  const { signIn, signInWithGoogle } = useContext(AuthContext); // ❌ removed setUser
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      await signIn(email.trim(), password);

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1600);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
        confirmButtonColor: "#14b8a6",
      });
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (!result) return;

    Swal.fire({
      icon: "success",
      title: "Signed in with Google!",
      showConfirmButton: false,
      timer: 1500,
    });

    setTimeout(() => {
      navigate(from, { replace: true });
    }, 1600);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-teal-50 px-4">
      <Zoom triggerOnce>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">
            Login to Prescription Application
          </h2>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-md font-semibold transition"
            >
              Login
            </button>
          </form>

          <div className="my-6 text-center text-sm text-teal-600 font-semibold">OR</div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-teal-400 py-3 rounded-md text-teal-700 font-semibold hover:bg-teal-100 transition"
          >
            <FaGoogle size={20} />
            Login with Google
          </button>

          <p className="mt-8 text-center text-sm text-teal-700">
            Don’t have an account?{" "}
            <Link to="/register" className="underline font-semibold hover:text-teal-900">
              Register here
            </Link>
          </p>
        </div>
      </Zoom>
    </section>
  );
};
