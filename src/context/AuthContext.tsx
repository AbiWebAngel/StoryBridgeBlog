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
import { getAdditionalUserInfo,sendPasswordResetEmail } from "firebase/auth";


// User role type
type Role = "admin" | "author" | "reader" | null;

// Extend Firebase User to include initials, role, and first/last name
export interface AppUser extends User {
  initials?: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
}

// Auth context interface
interface AuthContextProps {
  user: AppUser | null;
  role: Role;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginModalOpen: boolean;      // 👈 add this
  openLoginModal: (forgot?: boolean) => void;  // 👈 add this
  closeLoginModal: () => void;  // 👈 add this
  forceForgot: boolean;         // 👈 add this
}


// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);
// inside AuthProvider


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [forceForgot, setForceForgot] = useState(false);

  const openLoginModal = (forgot = false) => {
    setForceForgot(forgot); // if true, opens forgot section
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setForceForgot(false);
    setLoginModalOpen(false);
  };


  const googleProvider = new GoogleAuthProvider();
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };
  // Fetch Firestore user doc
  const fetchUserDoc = async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    const data = snap.data();
    const firstName = data.firstName ?? "";
    const lastName = data.lastName ?? "";

    return {
      ...data,
      firstName,
      lastName,
      initials: data.initials || getInitials(firstName, lastName),
      role: data.role ?? "reader",
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
        ...firebaseUser,
        firstName: userData?.firstName ?? "",
        lastName: userData?.lastName ?? "",
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
      firstName: userData?.firstName ?? "",
      lastName: userData?.lastName ?? "",
      initials: userData?.initials ?? "",
      role: userData?.role ?? "reader",
    };

    setUser(mergedUser);
    setRole(mergedUser.role ?? "reader");
  };

  // Email/password registration
  const registerWithEmail = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const initials = getInitials(firstName || "", lastName || "");

  await setDoc(doc(db, "users", userCred.user.uid), {
    email,
    firstName: firstName || "",
    lastName: lastName || "",
    initials,
    role: "reader",
    createdAt: new Date(),
  });

  const mergedUser: AppUser = {
    ...userCred.user,
    firstName: firstName || "",
    lastName: lastName || "",
    initials,
    role: "reader",
  };

  setUser(mergedUser);
  setRole("reader");
};

  // Google login
 // Replace your current loginWithGoogle with this (AuthContext)
 
const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  // 🔍 INSPECT EVERYTHING GOOGLE RETURNS
  console.log("🔥 Google RAW result:", result);
  console.log("🔥 Additional info:", getAdditionalUserInfo(result));
  console.log("🔥 Provider profile:", getAdditionalUserInfo(result)?.profile);
  console.log("🔥 gUser.displayName:", result.user.displayName);

  const gUser = result.user;
  const userRef = doc(db, "users", gUser.uid);
  const snap = await getDoc(userRef);

 const info = getAdditionalUserInfo(result);
 const profile = info?.profile as Record<string, string> | undefined ?? {};


 // 1️⃣ Try structured Google fields first
let firstName = profile?.given_name || "";
let lastName = profile?.family_name || "";

// 2️⃣ Fallback to displayName splitting
if (!firstName && !lastName) {
  const displayName = gUser.displayName ?? "";
  const parts = displayName.trim().split(/\s+/);
  firstName = parts[0] ?? "";
  lastName = parts.slice(1).join(" ") ?? "";
}

// 3️⃣ Final fallback — avoid undefined
firstName = firstName.trim();
lastName = lastName.trim();

console.log("🔥 Extracted Names =>", { firstName, lastName });

  let userData: { initials: string; role: Role; firstName: string; lastName: string };

  if (!snap.exists()) {
    const initials = getInitials(firstName, lastName);

    // Merge true to avoid overwriting other fields if doc is created elsewhere
    await setDoc(
      userRef,
      {
        email: gUser.email ?? "",
        firstName,
        lastName,
        initials,
        role: "reader",
        createdAt: new Date(),
      },
      { merge: true }
    );

    userData = { initials, role: "reader", firstName, lastName };
  } else {
    const data = await fetchUserDoc(gUser.uid);
    userData = {
      initials: data?.initials ?? "",
      role: data?.role ?? "reader",
      firstName: data?.firstName ?? firstName,
      lastName: data?.lastName ?? lastName,
    };

    // If Firestore doc exists but missing name info, optionally patch it:
    if ((!data?.firstName || !data?.lastName) && (firstName || lastName)) {
      await setDoc(
        userRef,
        {
          firstName: data?.firstName || firstName,
          lastName: data?.lastName || lastName,
        },
        { merge: true }
      );
    }
  }

  const mergedUser: AppUser = {
    ...gUser,
    firstName: userData.firstName,
    lastName: userData.lastName,
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
        resetPassword,
        logout,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        forceForgot,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
