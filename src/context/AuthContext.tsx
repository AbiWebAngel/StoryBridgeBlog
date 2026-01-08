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

type Role = "admin" | "author" | "reader" | null;

export interface AppUser extends User {
  initials?: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
}

function attachProfileToUser(
  firebaseUser: User,
  profile?: { firstName?: string; lastName?: string; initials?: string; role?: Role }
): AppUser {
  const user = firebaseUser as AppUser;
  user.firstName = profile?.firstName ?? "";
  user.lastName = profile?.lastName ?? "";
  user.initials = profile?.initials ?? "";
  user.role = profile?.role ?? "reader";
  return user;
}

interface AuthContextProps {
  user: AppUser | null;
  role: Role;
  authReady: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginModalOpen: boolean;
  openLoginModal: (forgot?: boolean) => void;
  closeLoginModal: () => void;
  forceForgot: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [authReady, setAuthReady] = useState(false);
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

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

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
      disabled: data.disabled ?? false,
    };
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setAuthReady(true);
        return;
      }

      try {
        await firebaseUser.getIdToken(true);
      } catch {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setAuthReady(true);
        return;
      }

      const userData = await fetchUserDoc(firebaseUser.uid);
      const mergedUser = attachProfileToUser(firebaseUser, {
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        initials: userData?.initials,
        role: userData?.role,
      });

      setUser(mergedUser);
      setRole(mergedUser.role ?? "reader");

      const idToken = await firebaseUser.getIdToken();
      document.cookie = `auth-token=${idToken}; path=/;`;
      document.cookie = `user-role=${mergedUser.role}; path=/;`;

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Email login
  const loginWithEmail = async (email: string, password: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const userData = await fetchUserDoc(userCred.user.uid);
    const mergedUser = attachProfileToUser(userCred.user, {
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      initials: userData?.initials,
      role: userData?.role,
    });
    setUser(mergedUser);
    setRole(mergedUser.role ?? "reader");
    const idToken = await userCred.user.getIdToken();
    document.cookie = `auth-token=${idToken}; path=/;`;
    document.cookie = `user-role=${mergedUser.role}; path=/;`;
  };

  // Registration
  const registerWithEmail = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const initials = getInitials(firstName || "", lastName || "");
    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      initials,
      role: "reader",
      disabled: false,
      createdAt: new Date(),
    });
    const mergedUser = attachProfileToUser(userCred.user, { firstName, lastName, initials, role: "reader" });
    setUser(mergedUser);
    setRole("reader");
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
        { email: gUser.email ?? "", firstName, lastName, initials, role: "reader", disabled: false, createdAt: new Date() },
        { merge: true }
      );
      userData = { firstName, lastName, initials, role: "reader" };
    } else {
      const data = await fetchUserDoc(gUser.uid);
      userData = { firstName: data?.firstName ?? firstName, lastName: data?.lastName ?? lastName, initials: data?.initials ?? "", role: data?.role ?? "reader" };
    }
    const mergedUser = attachProfileToUser(gUser, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      initials: userData.initials,
      role: userData.role,
    });
    setUser(mergedUser);
    setRole(mergedUser.role ?? "reader");
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
        authReady,
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
