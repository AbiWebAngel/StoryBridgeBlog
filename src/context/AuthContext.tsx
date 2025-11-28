"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getInitials } from "@/utils/getInitials";

// User role type
type Role = "admin" | "author" | "reader" | null;

// Extend Firebase User to include initials, role, and name
export interface AppUser extends User {
  initials?: string;
  role?: Role;
  name?: string;
}

// Auth context interface
interface AuthContextProps {
  user: AppUser | null;
  role: Role;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  // Fetch Firestore user doc and ensure type safety
  const fetchUserDoc = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    const data = snap.data();
    const name = data.name ?? data.displayName ?? "";
    const role = (data.role as Role) || "reader";

    return {
      ...data,
      name,
      initials: data.initials || getInitials(name),
      role,
    };
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const userData = await fetchUserDoc(firebaseUser.uid);

      const mergedUser: AppUser = {
        ...firebaseUser,                  // keep all Firebase User properties & methods
        name: userData?.name ?? firebaseUser.displayName ?? "",
        initials: userData?.initials ?? "",
        role: userData?.role ?? "reader",
      };

      setUser(mergedUser);
      setRole(mergedUser.role ?? "reader");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/password login
  const loginWithEmail = async (email: string, password: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userData = await fetchUserDoc(userCred.user.uid);

    const mergedUser: AppUser = {
      ...userCred.user,
      name: userData?.name ?? userCred.user.displayName ?? "",
      initials: userData?.initials ?? "",
      role: userData?.role ?? "reader",
    };

    setUser(mergedUser);
    setRole(mergedUser.role ?? "reader");
  };

  // Email/password registration
  const registerWithEmail = async (email: string, password: string, name?: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const initials = getInitials(name || "");

    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      name: name || "",
      initials,
      role: "reader",
      createdAt: new Date(),
    });

    const mergedUser: AppUser = {
      ...userCred.user,
      name: name || "",
      initials,
      role: "reader",
    };

    setUser(mergedUser);
    setRole("reader");
  };

  // Google login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;
    const userRef = doc(db, "users", gUser.uid);
    const snap = await getDoc(userRef);

    let userData: { initials: string; role: Role; name: string };

    if (!snap.exists()) {
      const initials = getInitials(gUser.displayName || "");
      const name = gUser.displayName || "";
      await setDoc(userRef, {
        email: gUser.email,
        name,
        initials,
        role: "reader",
        createdAt: new Date(),
      });
      userData = { initials, role: "reader", name };
    } else {
      const data = await fetchUserDoc(gUser.uid);
      userData = {
        initials: data?.initials ?? "",
        role: data?.role ?? "reader",
        name: data?.name ?? "",
      };
    }

    const mergedUser: AppUser = {
      ...gUser,
      name: userData.name,
      initials: userData.initials,
      role: userData.role,
    };

    setUser(mergedUser);
    setRole(mergedUser.role ?? "reader");
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
