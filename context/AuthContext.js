// context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

// ─────────────────────────────────────────────
// WHY createContext?
// createContext creates a "global container" for auth data.
// Any screen in the app can read from it without passing
// props manually through every component.
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // WHY two states?
  // `user`    → holds the logged-in Firebase user object (or null if logged out)
  // `loading` → true while Firebase checks AsyncStorage for a saved session
  //             We show a spinner during this time so the app doesn't
  //             flash the login screen before checking saved session
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // WHY onAuthStateChanged?
    // This is a Firebase listener that fires automatically:
    //   • On app start  → checks AsyncStorage for a saved login session
    //   • On login      → gives us the new user object
    //   • On logout     → gives us null
    // This means we NEVER have to manually check "is user logged in?"
    // Firebase handles it and tells us via this listener.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);    // null = logged out, object = logged in
      setLoading(false);        // done checking → hide spinner
    });

    // WHY return unsubscribe?
    // Cleans up the listener when the component unmounts.
    // Without this, the listener keeps running and causes memory leaks.
    return unsubscribe;
  }, []);

  // WHY wrap children in AuthContext.Provider?
  // This makes `user` and `loading` available to every screen
  // in the app without prop drilling.
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// WHY custom hook useAuth?
// Instead of writing useContext(AuthContext) in every screen,
// we write useAuth() — shorter and cleaner.
// Usage in any screen: const { user, loading } = useAuth();
export const useAuth = () => useContext(AuthContext);