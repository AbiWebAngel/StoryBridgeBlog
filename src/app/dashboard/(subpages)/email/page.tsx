"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  getAuth, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { validateEmail, validatePassword } from "@/utils/validators";

export default function EmailPage() {
  const { user } = useAuth();
  const auth = getAuth();

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    newEmail: "",
    confirmEmail: "",
    password: "",
  });
  const [isReauthenticated, setIsReauthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"Weak" | "Medium" | "Strong" | null>(null);
  const [isProviderUser, setIsProviderUser] = useState(false);
  const [providerName, setProviderName] = useState<string>("");
  const [reauthenticationAttempts, setReauthenticationAttempts] = useState(0);
  const [reauthSuccess, setReauthSuccess] = useState("");
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");
  const MAX_REAUTH_ATTEMPTS = 3;
  const REAUTH_ATTEMPT_RESET_MS = 15 * 60 * 1000; // 15 minutes
  const [cooldown, setCooldown] = useState(0); 
  const [fetching, setfetching] = useState(true);

  // Check if user is from a provider (Google, etc.) and populate data
useEffect(() => {
  if (user) {
    setCurrentEmail(user.email || "");
    setfetching(false);
    
    // Check provider info...
    if (user.providerData && user.providerData.length > 0) {
      const providerId = user.providerData[0]?.providerId;
      const isProvider = providerId !== "password";
      setIsProviderUser(isProvider);

      if (providerId === "google.com") setProviderName("Google");
      else if (providerId === "facebook.com") setProviderName("Facebook");
      else if (providerId === "github.com") setProviderName("GitHub");
      else if (providerId === "apple.com") setProviderName("Apple");
      else if (isProvider) setProviderName("Social Provider");
    }
  }
}, [user]);



  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);



  // Real-time password strength check (only for email/password users)
  useEffect(() => {
    if (password && !isReauthenticated && !isProviderUser) {
      const validation = validatePassword(password);
      // Check if validation is an object (not just a string error)
      if (typeof validation === 'object' && validation !== null && 'strength' in validation) {
        setPasswordStrength(validation.strength);
      } else {
        setPasswordStrength(null);
      }
    } else {
      setPasswordStrength(null);
    }
  }, [password, isReauthenticated, isProviderUser]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      newEmail: "",
      confirmEmail: "",
      password: "",
    };

    // Validate new email
    const emailError = validateEmail(newEmail);
    if (emailError) {
      errors.newEmail = emailError;
      isValid = false;
    }

    // Validate email confirmation
    if (newEmail !== confirmEmail) {
      errors.confirmEmail = "Emails do not match";
      isValid = false;
    }

    // Validate password (only for email/password users who aren't reauthenticated)
    if (!isReauthenticated && !isProviderUser) {
      const passwordValidation = validatePassword(password);
      
      // Check if passwordValidation is an object with error property
      if (typeof passwordValidation === 'object' && passwordValidation !== null) {
        if (passwordValidation.error) {
          errors.password = passwordValidation.error;
          isValid = false;
        }
      } else if (typeof passwordValidation === 'string') {
        // If passwordValidation is a string (error message)
        errors.password = passwordValidation;
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleReauthentication = async () => {
    if (!user) return;

    // Clear previous messages
    setSuccessMessage("");
    setErrorMessage("");

    // For provider users, skip password validation
    if (!isProviderUser) {
      // Validate password for email/password users
      const passwordValidation = validatePassword(password);

      let passwordError = "";
      // Handle both string error and object return types
      if (typeof passwordValidation === 'string') {
        passwordError = passwordValidation;
      } else if (typeof passwordValidation === 'object' && passwordValidation.error) {
        passwordError = passwordValidation.error;
      }

      if (passwordError) {
        setValidationErrors(prev => ({ ...prev, password: passwordError }));
        setErrorMessage("Please fix the errors in the form.");
        return;
      }

      // Additional password check
      if (!password || password.trim() === '') {
        setValidationErrors(prev => ({ ...prev, password: "Password is required" }));
        setErrorMessage("Password is required for verification.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isProviderUser) {
        // Handle OAuth provider reauthentication
        const providerId = user.providerData[0]?.providerId;
        
        if (providerId === "google.com") {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(auth.currentUser!, provider);
        } else {
          // For other OAuth providers, you can handle them similarly
          // Note: Some providers may require specific setup
          setErrorMessage(`${providerName} reauthentication is not fully implemented. Please sign out and back in.`);
          setLoading(false);
          return;
        }
      } else {
        // Handle email/password reauthentication
        if (!user.email) {
          setErrorMessage("Email not found for this account.");
          setLoading(false);
          return;
        }
        
        // Create credential with current user's email
        const credential = EmailAuthProvider.credential(user.email, password);
        
        try {
          await reauthenticateWithCredential(auth.currentUser!, credential);
        } catch (authError: any) {
        // Increment attempt counter
        setReauthenticationAttempts(prev => {
        const newCount = prev + 1;

        if (newCount >= MAX_REAUTH_ATTEMPTS) {
          // Start cooldown timer
          setCooldown(REAUTH_ATTEMPT_RESET_MS / 1000); // convert ms to seconds

          const interval = setInterval(() => {
            setCooldown(prevCooldown => {
              if (prevCooldown <= 1) {
                clearInterval(interval);
                setReauthenticationAttempts(0); // reset attempts after cooldown
                return 0;
              }
              return prevCooldown - 1;
            });
          }, 1000);
        }

        return newCount;
      });

        // Clear password on wrong password for security
        setPassword("");
        setValidationErrors(prev => ({ ...prev, password: "" }));
        
        throw authError;
      }
      }
      
      setIsReauthenticated(true);
      setReauthenticationAttempts(0); // Reset attempts on success
      setSuccessMessage("Identity verified. You can now change your email.");
      
      // Clear password validation error
      setValidationErrors(prev => ({ ...prev, password: "" }));
    } catch (err: any) {
      console.error("Reauthentication error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage("Incorrect password. Please try again.");
        setValidationErrors(prev => ({ ...prev, password: "Incorrect password" }));
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage("Too many failed attempts. Please try again later.");
      } else if (err.code === 'auth/user-mismatch') {
        setErrorMessage("Authentication error. Please sign out and try again.");
      } else if (err.code === 'auth/user-not-found') {
        setErrorMessage("User not found. Please sign out and try again.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage("Authentication popup was closed. Please try again.");
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === 'auth/operation-not-supported-in-this-environment') {
        setErrorMessage("This authentication method is not supported in your current environment.");
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMessage("Network error. Please check your connection and try again.");
      } else {
        setErrorMessage(`Reauthentication failed: ${err.message || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };
const handleChangeEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  setSuccessMessage("");
  setErrorMessage("");

  if (!isReauthenticated) {
    setErrorMessage("Please verify your identity first.");
    return;
  }

  if (!validateForm()) {
    setErrorMessage("Please fix the errors in the form.");
    return;
  }

  if (newEmail.trim() === currentEmail.trim()) {
    setErrorMessage("New email is the same as current email.");
    return;
  }

  setLoading(true);

  try {
    // Send verification email
    await verifyBeforeUpdateEmail(auth.currentUser!, newEmail.trim());

    // Update Firestore record
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { email: newEmail.trim() });

    // Show success message with logout countdown
    let countdown = 10;
    setSuccessMessage(`Verification email sent! Please check your email (and spam folder) to confirm. You will be logged out in ${countdown} seconds...`);


    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
       setSuccessMessage(`Verification email sent! Please check your email (and spam folder) to confirm. You will be logged out in ${countdown} seconds...`);
      } else {
        clearInterval(timer);
        auth.signOut();
      }
    }, 1000);

    // Clear form
    setNewEmail("");
    setConfirmEmail("");
    setPassword("");
    setIsReauthenticated(false);
    setPasswordStrength(null);
    setValidationErrors({
      newEmail: "",
      confirmEmail: "",
      password: "",
    });

  } catch (err: any) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      setErrorMessage("Email is already in use by another account.");
    } else if (err.code === "auth/invalid-email") {
      setErrorMessage("Invalid email format.");
    } else if (err.code === "auth/requires-recent-login") {
      setErrorMessage("Session expired. Please reauthenticate again.");
      setIsReauthenticated(false);
    } else if (err.code === "auth/network-request-failed") {
      setErrorMessage("Network error. Please check your connection and try again.");
    } else if (err.code === "auth/operation-not-allowed") {
      setErrorMessage("Email change is not allowed for this account type.");
    } else {
      setErrorMessage("Error updating email. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // Handle real-time validation on blur
  const handleNewEmailBlur = () => {
    const error = validateEmail(newEmail);
    setValidationErrors(prev => ({ ...prev, newEmail: error || "" }));
  };

  const handleConfirmEmailBlur = () => {
    if (newEmail.trim() !== confirmEmail.trim()) {
      setValidationErrors(prev => ({ 
        ...prev, 
        confirmEmail: "Emails do not match" 
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, confirmEmail: "" }));
    }
  };

  const handlePasswordBlur = () => {
    if (!isReauthenticated && !isProviderUser) {
      const passwordValidation = validatePassword(password);
      let passwordError = "";
      
      if (typeof passwordValidation === 'string') {
        passwordError = passwordValidation;
      } else if (typeof passwordValidation === 'object' && passwordValidation.error) {
        passwordError = passwordValidation.error || "";
      }
      
      setValidationErrors(prev => ({ 
        ...prev, 
        password: passwordError 
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Clear error when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const resetForm = () => {
    setNewEmail("");
    setConfirmEmail("");
    setPassword("");
    setIsReauthenticated(false);
    setPasswordStrength(null);
    setReauthenticationAttempts(0);
    setValidationErrors({
      newEmail: "",
      confirmEmail: "",
      password: "",
    });
    setSuccessMessage("");
    setErrorMessage("");
  };

   // 🔹 Show loading bar while fetching
 if (fetching) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>
      <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
        Loading email...
      </p>
    </div>
  );
}

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4A3820] text-lg font-sans!">
        Please log in to view page
      </div>
    );
  }
  
  return (
    <div className="min-h-screen px-6 font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          Change Email
        </h1>
        
        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changing your email requires verification. After submitting, you'll receive a confirmation link at your new email address. You may need to sign out and back in after verification.
            </p>
          </div>
        </div>

        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          <h1 className={`text-2xl font-sans! font-medium text-[#4A3820] mb-6`}>
            Update Email Address
          </h1>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Authentication Phase */}
          {!isReauthenticated ? (
            <div className="space-y-6">
              {/* Current Email - Always visible */}
              <div>
                <div className="rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C] w-full">
                  <div className="flex items-center">
                    {/* Email Icon */}
                    <div className="mr-2 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                        <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69L160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31l313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={currentEmail}
                      disabled
                      className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-sans! text-base md:text-lg bg-transparent opacity-70 cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 ml-3">
                  <p className="text-black">
                    Your current email address
                  </p>
                  {isProviderUser && (
                    <span className="text-xs! text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {providerName} account
                    </span>
                  )}
                </div>
              </div>

              {/* PASSWORD (for email/password users) */}
              {!isProviderUser && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 rounded-full border-4 shadow-md px-4 py-2 ${
                      validationErrors.password 
                        ? "border-red-500" 
                        : "border-[#805C2C]"
                    }`}>
                      <div className="flex items-center">
                        {/* Password Icon */}
                        <div className="mr-2 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" height="25" className="md:h-7.5" viewBox="0 -960 960 960" width="25" fill="#403727">
                            <path d="M252.31-100q-29.92 0-51.12-21.19Q180-142.39 180-172.31v-375.38q0-29.92 21.19-51.12Q222.39-620 252.31-620H300v-80q0-74.92 52.54-127.46Q405.08-880 480-880q74.92 0 127.46 52.54Q660-774.92 660-700v80h47.69q29.92 0 51.12 21.19Q780-577.61 780-547.69v375.38q0 29.92-21.19 51.12Q737.61-100 707.69-100H252.31Zm0-60h455.38q5.39 0 8.85-3.46t3.46-8.85v-375.38q0-5.39-3.46-8.85t-8.85-3.46H252.31q-5.39 0-8.85 3.46t-3.46 8.85v375.38q0 5.39 3.46 8.85t8.85 3.46ZM480-290q29.15 0 49.58-20.42Q550-330.85 550-360t-20.42-49.58Q509.15-430 480-430t-49.58 20.42Q410-389.15 410-360t20.42 49.58Q450.85-290 480-290ZM360-620h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/>
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          onBlur={handlePasswordBlur}
                          placeholder="Enter your current password"
                          className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727]  font-sans! text-base md:text-lg bg-transparent"
                          required
                          disabled={loading}
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                    
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 text-[#403727] hover:text-[#705431] p-2 h-11 w-11 md:h-13 md:w-13 flex items-center justify-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={loading}
                    >
                      <svg width="20" height="20" className="md:w-6.25 md:h-6.25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {passwordStrength && (
                    <div className="flex justify-between items-center mt-2 ml-3">
                      <span className={`text-sm font-medium ${
                        passwordStrength === "Strong" ? "text-green-600" :
                        passwordStrength === "Medium" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        Password Strength: {passwordStrength}
                      </span>
                    </div>
                  )}
                  {validationErrors.password && (
                    <p className="text-red-600 text-sm mt-1 ml-3">
                      {validationErrors.password}
                    </p>
                  )}
                  
                  {/* Attempt counter warning */}
               {reauthenticationAttempts >= MAX_REAUTH_ATTEMPTS && cooldown > 0 && (
                  <p className="text-red-600 text-sm mt-1 ml-3">
                    Too many failed attempts. Please wait {cooldown} second{cooldown !== 1 ? 's' : ''} before trying again.
                  </p>
                )}

                </div>
              )}

              {/* VERIFY IDENTITY BUTTON */}
              <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleReauthentication}
                disabled={loading || (!isProviderUser && !password) || reauthenticationAttempts >= MAX_REAUTH_ATTEMPTS}
                className="py-3 px-8  font-sans! bg-[#805C2C] text-[#FFFFFF] rounded-[30px] hover:bg-[#705431] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg w-full sm:w-auto"
              >

                  <span className="text-[#FFFFFF] font-medium flex items-center justify-center gap-2">
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : isProviderUser ? (
                      <>
                        {providerName === "Google" && (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        Verify Identity with {providerName}
                      </>
                    ) : (
                      "Verify Identity"
                    )}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Email Change Phase (after authentication) */
            <form onSubmit={handleChangeEmail} className="space-y-6">
             

              {/* Current Email Display */}
              <div>
                <div className="rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C] w-full">
                  <div className="flex items-center">
                    {/* Email Icon */}
                    <div className="mr-2 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                        <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69L160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31l313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={currentEmail}
                      disabled
                      className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-sans! text-base md:text-lg bg-transparent opacity-70 cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 ml-3">
                  <p className="text-black">
                    Your current email address
                  </p>
                  {isProviderUser && (
                    <span className="text-xs! text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {providerName} account
                    </span>
                  )}
                </div>
              </div>

              {/* NEW EMAIL */}
              <div>
                <div className={`rounded-full border-4 shadow-md px-4 py-2 w-full ${
                  validationErrors.newEmail 
                    ? "border-red-500" 
                    : "border-[#805C2C]"
                }`}>
                  <div className="flex items-center">
                    {/* Email Icon */}
                    <div className="mr-2 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                        <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69L160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31l313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="newEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onBlur={handleNewEmailBlur}
                      placeholder="New Email Address"
                      className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727]  font-sans! text-base md:text-lg bg-transparent"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>
                {validationErrors.newEmail && (
                  <p className="text-red-600 text-sm mt-1 ml-3">
                    {validationErrors.newEmail}
                  </p>
                )}
              </div>

              {/* CONFIRM EMAIL */}
              <div>
                <div className={`rounded-full border-4 shadow-md px-4 py-2 w-full ${
                  validationErrors.confirmEmail 
                    ? "border-red-500" 
                    : "border-[#805C2C]"
                }`}>
                  <div className="flex items-center">
                    {/* Check Icon */}
                    <div className="mr-2 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                        <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31Z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      onBlur={handleConfirmEmailBlur}
                      placeholder="Confirm New Email"
                      className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-sans! text-base md:text-lg bg-transparent"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>
                {validationErrors.confirmEmail && (
                  <p className="text-red-600 text-sm mt-1 ml-3">
                    {validationErrors.confirmEmail}
                  </p>
                )}
              </div>

              {/* SEND VERIFICATION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="submit"
                  disabled={loading || !newEmail || !confirmEmail}
                  className="py-3 px-8 font-sans! bg-green-600 text-[#FFFFFF] rounded-[30px] hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg"
                >
                  <span className="text-[#FFFFFF] font-medium">
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : "Send Verification Email"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="py-3 px-8 font-sans! bg-gray-500 text-[#FFFFFF] rounded-[30px] hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg"
                >
                  <span className="text-[#FFFFFF] font-medium">
                    Cancel
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}