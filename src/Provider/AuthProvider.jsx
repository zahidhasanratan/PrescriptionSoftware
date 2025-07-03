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

/* ─── 1.  Allow-listed addresses (add / remove as you like) ───────────────── */
export const ALLOWED_EMAILS = [
  "zhdhsn6@gmail.com",
  "zahidweb1224@gmail.com",
  "zahidweb1224@gmail.com",
  "mavrick.utpal@gmail.com",
];

/* small util: compare e-mails in a case- & space-insensitive way */
const normalize = (s = "") => s.trim().toLowerCase();
const isAllowed = (firebaseUser) =>
  firebaseUser && ALLOWED_EMAILS.some((e) => normalize(e) === normalize(firebaseUser.email));

/* ─── Provider component ─────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* sign-in / sign-up helpers */
  const createUser       = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const signIn           = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signInWithGoogle = ()                   => signInWithPopup(auth, googleProvider);
  const logout           = ()                   => signOut(auth);

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
