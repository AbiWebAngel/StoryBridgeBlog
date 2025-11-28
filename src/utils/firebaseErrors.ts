// utils/firebaseErrors.ts
import { FirebaseError } from "firebase/app";

export const getFriendlyErrorMessage = (error: FirebaseError) => {
  const code = error.code || "";

  switch (code) {
    // Login errors
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/popup-closed-by-user":
      return "Login popup closed. Please try again.";
    case "auth/cancelled-popup-request":
      return "Login cancelled. Try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with a different sign-in method.";
    case "auth/invalid-credential":
      return "Invalid login credentials. Please try again.";

    // Registration errors
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password is too weak. Try at least 6 characters.";

    default:
      return error.message || "Something went wrong. Please try again.";
  }
};

