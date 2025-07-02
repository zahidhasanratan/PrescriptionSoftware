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

/* ─── public API (context) ───────────────────────────────────────────────── */
export const AuthContext = createContext();

/* ─── Firebase helpers ───────────────────────────────────────────────────── */
const auth           = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/* ─── 1.  Allow-listed addresses (add / remove as you like) ──────────────── */
const ALLOWED_EMAILS = [
  "zhdhsn6@gmail.com",
  "zahid@zahid.com",
];

/* small util: compare e-mails in a case- & space-insensitive way */
const norm = (s = "") => s.trim().toLowerCase();
const isAllowed = (firebaseUser) =>
  firebaseUser && ALLOWED_EMAILS.some((e) => norm(e) === norm(firebaseUser.email));

/* ─── Provider component ─────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* sign-in / sign-up helpers (unchanged) */
  const createUser       = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const signIn           = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signInWithGoogle = ()                      => signInWithPopup(auth, googleProvider);
  const logout           = ()                      => signOut(auth);

  /* listen to every auth state change */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isAllowed(currentUser)) {
        setUser(currentUser);                     // authorised → keep him signed-in
      } else if (currentUser) {
        // signed-in but NOT on allow-list → sign him out immediately
        await signOut(auth);
        alert("Access denied: this e-mail is not authorised.");
        setUser(null);
      } else {
        setUser(null);                            // signed-out state
      }
      setLoading(false);
    });

    return unsubscribe;                           // cleanup listener
  }, []);

  /* what consumers of AuthContext will see */
  const authData = {
    user,
    setUser,                // keep exposed for components that already use it
    loading,
    createUser,
    signIn,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};
