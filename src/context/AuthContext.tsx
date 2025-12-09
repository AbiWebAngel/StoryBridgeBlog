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
  getAdditionalUserInfo,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getInitials } from "@/utils/getInitials";

// Role type
type Role = "admin" | "author" | "reader" | null;

// Extended user
export interface AppUser extends User {
  initials?: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
}

// Context interface
interface AuthContextProps {
  user: AppUser | null;
  role: Role;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginModalOpen: boolean;
  openLoginModal: (forgot?: boolean) => void;
  closeLoginModal: () => void;
  forceForgot: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [forceForgot, setForceForgot] = useState(false);

  const openLoginModal = (forgot = false) => {
    setForceForgot(forgot);
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

  // Fetch user from Firestore
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

      // ✅ Correct token & cookie handling
      const idToken = await firebaseUser.getIdToken();
      document.cookie = `auth-token=${idToken}; path=/;`;
      document.cookie = `user-role=${mergedUser.role}; path=/;`;

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email login
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

    // ✅ Cookies
    const idToken = await userCred.user.getIdToken();
    document.cookie = `auth-token=${idToken}; path=/;`;
    document.cookie = `user-role=${mergedUser.role}; path=/;`;
  };

  // Registration
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

    // ✅ Cookies
    const idToken = await userCred.user.getIdToken();
    document.cookie = `auth-token=${idToken}; path=/;`;
    document.cookie = `user-role=reader; path=/;`;
  };

  // Google login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);

    const gUser = result.user;
    const info = getAdditionalUserInfo(result);
    const profile = (info?.profile as Record<string, string>) ?? {};

    let firstName = profile.given_name || "";
    let lastName = profile.family_name || "";

    if (!firstName && !lastName) {
      const parts = (gUser.displayName ?? "").trim().split(/\s+/);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ") ?? "";
    }

    const userRef = doc(db, "users", gUser.uid);
    const snap = await getDoc(userRef);

    let userData;

    if (!snap.exists()) {
      const initials = getInitials(firstName, lastName);

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

      userData = { firstName, lastName, initials, role: "reader" };
    } else {
      const data = await fetchUserDoc(gUser.uid);
      userData = {
        firstName: data?.firstName ?? firstName,
        lastName: data?.lastName ?? lastName,
        initials: data?.initials ?? "",
        role: data?.role ?? "reader",
      };
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

    // ✅ Cookies
    const idToken = await gUser.getIdToken();
    document.cookie = `auth-token=${idToken}; path=/;`;
    document.cookie = `user-role=${mergedUser.role}; path=/;`;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);

    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "user-role=; path=/; max-age=0";
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
