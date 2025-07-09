// ── src/contexts/AuthProvider.jsx ───────────────────────────────────────────
import React, { createContext, useEffect, useState } from "react";
import { app } from "../Firebase/firebase.config";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";

export const AuthContext = createContext();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const ALLOWED_EMAILS = [
  "zhdhsn6@gmail.com",
  "zahidweb1224@gmail.com",
  "mavrick.utpal@gmail.com",
  "info@esoft.com.bd",
  "drkarim1990@gmail.com",
];

const normalize = (email = "") => email.trim().toLowerCase();
const isAllowed = (firebaseUser) =>
  firebaseUser && ALLOWED_EMAILS.some((e) => normalize(e) === normalize(firebaseUser.email));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!isAllowed(result.user)) {
        await signOut(auth);
        alert("Access denied: this e-mail is not authorised.");
        return null;
      }
      return result;
    } catch (err) {
      console.error("Google Sign-in error:", err.code, err.message);
      alert("Google Sign-In failed: " + err.message);
      return null;
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isAllowed(currentUser)) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authData = {
    user,
    loading,
    createUser,
    signIn,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};
