// ── src/Pages/Auth/Register.jsx ─────────────────────────────────────────────
import React, { useState, useContext } from "react";
import { Zoom } from "react-awesome-reveal";
import { FcGoogle } from "react-icons/fc";
import { AuthContext, ALLOWED_EMAILS } from "../../Provider/AuthProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";

const normalize = (s = "") => s.trim().toLowerCase();

export const Register = () => {
  const { createUser, signInWithGoogle, logout, user: firebaseUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(pw);

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, photoURL, password } = formData;

    // ── allow-list guard ───────────────────────────
    if (!ALLOWED_EMAILS.some((allowed) => normalize(allowed) === normalize(email))) {
      return Swal.fire({
        icon: "error",
        title: "Not Authorized",
        text: "This email is not allowed to register.",
        confirmButtonColor: "#14b8a6",
      });
    }

    if (!validatePassword(password)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text:
          "Password must be at least 8 characters and include uppercase, lowercase, and a special character.",
        confirmButtonColor: "#14b8a6",
      });
    }

    try {
      const result = await createUser(email, password);
      await updateProfile(result.user, { displayName: name, photoURL });
      // no need to manually setUser here—onAuthStateChanged will fire
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => navigate("/"), 1600);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message,
        confirmButtonColor: "#14b8a6",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      // onAuthStateChanged will kick out any non-allowlisted user automatically
      Swal.fire({
        icon: "success",
        title: "Signed in with Google!",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => navigate("/"), 1600);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Google Sign-In Failed",
        text: error.message,
        confirmButtonColor: "#14b8a6",
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-teal-50 px-4">
      <Zoom triggerOnce>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">
            Register
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {["name", "email", "photoURL", "password"].map((field) => (
              <div key={field}>
                <label
                  className="block text-sm font-semibold text-teal-700 mb-1 capitalize"
                >
                  {field === "photoURL" ? "Photo URL" : field}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  required
                  onChange={handleChange}
                  placeholder={
                    field === "photoURL"
                      ? "https://your-photo-url.com"
                      : field === "email"
                      ? "you@example.com"
                      : field === "password"
                      ? "••••••••"
                      : "John Doe"
                  }
                  className="w-full px-4 py-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-md font-semibold hover:bg-teal-700 transition"
            >
              Register
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-3">
            <hr className="w-16 border-teal-300" />
            <span className="text-teal-600 font-semibold">OR</span>
            <hr className="w-16 border-teal-300" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-8 w-full flex items-center justify-center gap-3 border border-teal-400 py-3 rounded-md text-teal-700 font-semibold hover:bg-teal-100 transition"
          >
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>
        </div>
      </Zoom>
    </section>
  );
};
