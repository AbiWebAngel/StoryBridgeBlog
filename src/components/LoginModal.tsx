// components/LoginModal.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/utils/firebaseErrors";
import { FirebaseError } from "firebase/app";
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  forceForgot?: boolean; 
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, forceForgot }: LoginModalProps) => {
  const { loginWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Separate state for Google button
  const [errorMessage, setErrorMessage] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
    setShowPassword(false);
    setErrorMessage("");
  };

  useEffect(() => {
    if (forceForgot) {
      setMode("forgot");
      setShowCaptcha(true);
    }
  }, [forceForgot]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Only affects email login button
    setErrorMessage("");

    try {
      if (showCaptcha && !captchaToken) {
        setErrorMessage("Please complete the captcha to continue.");
        setIsLoading(false);
        return;
      }

      await loginWithEmail(formData.email, formData.password);

      setLoginAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken(null);

      // Clear form before closing modal
      resetForm();
      onClose();

    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setErrorMessage(getFriendlyErrorMessage(error));
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }

      // Increment failed attempts
      setLoginAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) setShowCaptcha(true); // show captcha after 3 fails
        return newCount;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true); // Only affects Google button
    setErrorMessage("");

    try {
      await loginWithGoogle();

      resetForm();
      onClose();
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.log(error);
        setErrorMessage(getFriendlyErrorMessage(error));
      } else {
        console.log(error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    onClose();
    // Small delay to allow close animation to complete
    setTimeout(() => {
      onSwitchToRegister();
    }, 300);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Only affects forgot password button
    setErrorMessage("");

    try {
      if (!captchaToken) {
        setErrorMessage("Please complete the captcha to continue.");
        setIsLoading(false);
        return;
      }

      await resetPassword(formData.email);

      setErrorMessage("Password reset email sent! Check your inbox or the spam folder.");
      // Optionally switch back to login mode after successful reset
      setTimeout(() => {
        setMode("login");
        setErrorMessage("");
      }, 5000);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setErrorMessage(getFriendlyErrorMessage(error));
      } else {
        setErrorMessage("Unexpected error. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToForgotPassword = () => {
    setMode("forgot");
    resetForm();
    setShowCaptcha(true);
    setErrorMessage("");
  };

  const switchToLogin = () => {
    setMode("login");
    resetForm();
    setShowCaptcha(false);
    setCaptchaToken(null);
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/25 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close Button - Original position for desktop, mobile optimized */}
        <button
          onClick={onClose}
          className="absolute -top-10 -right-2 md:-top-8 md:-right-4 z-10 text-white hover:text-gray-300 transition-colors"
          aria-label="Close modal"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="bg-[#EDE5D8] rounded-3xl md:rounded-4xl overflow-hidden shadow-2xl border-2 border-[#EDE5D8] max-h-[90.5vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            {/* Form Section - Scrollable on desktop (same as RegisterModal) */}
            <div className="flex-1 p-6 md:p-8 flex flex-col order-2 md:order-1 overflow-y-auto scrollable-description max-h-[90vh]">
              <div className="max-w-md mx-auto w-full">
                
                {/* Heading */}
                <h2 className="text-[20px] md:text-[24px] font-inter text-[#000000] font-bold mb-6 md:mb-8">
                  {mode === "login" ? "Login" : "Reset Password"}
                </h2>

                {/* Login Form */}
                {mode === "login" ? (
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Email Field */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C]">
                        <div className="flex items-center">
                          {/* Email Icon */}
                          <div className="mr-2 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                              <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69 160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31 313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                            </svg>
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-inter text-base md:text-lg bg-transparent"
                            required
                          />
                        </div>
                      </div>
                      {/* Consistent spacer for both fields */}
                      <div className="shrink-0 w-11 md:w-13"></div>
                    </div>

                    {/* Password Field */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C]">
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
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-inter text-base md:text-lg bg-transparent"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="shrink-0 text-[#403727] hover:text-[#705431] p-2 h-11 w-11 md:h-13 md:w-13 flex items-center justify-center"
                        aria-label={showPassword ? "Hide password" : "Show password"}
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
    
                    {/* Forgot Password */}
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={switchToForgotPassword}
                        className="text-[#403727] font-inter text-base md:text-lg hover:text-[#705431] transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    
                    {showCaptcha && (
                      <div className="my-4">
                        <HCaptcha
                          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                          onVerify={(token) => setCaptchaToken(token)}
                          onExpire={() => setCaptchaToken(null)}
                        />
                      </div>
                    )}

                    {errorMessage && (
                      <div className="text-red-600 text-sm md:text-base font-inter mb-2">
                        {errorMessage}
                      </div>
                    )}

                    {/* Login Button */}
                    <button 
                      type="submit"
                      disabled={isLoading || isGoogleLoading} // Disable when either is loading
                      className="w-full py-3 font-inter bg-[#805C2C] text-[#FFFFFF] rounded-[30px] hover:bg-[#705431] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg"
                    >
                      <span className="text-[#FFFFFF] font-medium">
                        {isLoading ? "Logging in..." : "Login"}
                      </span>
                    </button>
                  </form>
                ) : (
                  /* Forgot Password Form */
                  <form onSubmit={handleForgotSubmit} className="space-y-6">
                    <div className="text-[#403727] font-inter text-base md:text-lg mb-4">
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </div>

                    {/* Email Field */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C]">
                        <div className="flex items-center">
                          {/* Email Icon */}
                          <div className="mr-2 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                              <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69 160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31 313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                            </svg>
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-inter text-base md:text-lg bg-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div className="shrink-0 w-11 md:w-13"></div>
                    </div>

                    {showCaptcha && (
                      <div className="my-4">
                        <HCaptcha
                          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                          onVerify={(token) => setCaptchaToken(token)}
                          onExpire={() => setCaptchaToken(null)}
                        />
                      </div>
                    )}

                    {errorMessage && (
                      <div className={`text-sm md:text-base font-inter mb-2 ${
                        errorMessage.includes("sent") ? "text-green-600" : "text-red-600"
                      }`}>
                        {errorMessage}
                      </div>
                    )}

                    {/* Reset Password Button */}
                    <button 
                      type="submit"
                      disabled={isLoading || isGoogleLoading} // Disable when either is loading
                      className="w-full py-3 font-inter bg-[#805C2C] text-[#FFFFFF] rounded-[30px] hover:bg-[#705431] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg"
                    >
                      <span className="text-[#FFFFFF] font-medium">
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </span>
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={switchToLogin}
                        className="text-[#403727] font-inter text-base md:text-lg hover:text-[#705431] transition-colors"
                      >
                        ← Back to Login
                      </button>
                    </div>
                  </form>
                )}

                {/* Only show these sections in login mode */}
                {mode === "login" && (
                  <>
                    {/* Divider with Or */}
                    <div className="relative flex items-center my-4 md:my-6">
                      <div className="grow border border-[#403727]"></div>
                      <span className="shrink mx-4 text-[#403727] font-inter text-sm font-bold">Or</span>
                      <div className="grow border border-[#403727]"></div>
                    </div>

                    {/* Google Login Button */}
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading || isGoogleLoading} // Disable when either is loading
                      className="w-full py-3 border-[#403727] rounded-[30px] flex items-center justify-center gap-3 bg-[#805C2C] hover:bg-[#705431] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg font-inter"
                    >
                      <svg width="18" height="18" className="md:w-5 md:h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      
                      <span className="text-[#FFFFFF] font-medium">
                        {isGoogleLoading ? "Logging in..." : "Login with Google"}
                      </span>
                    </button>

                    {/* Full Line Divider */}
                    <div className="border border-[#403727] my-4 md:my-6"></div>

                    {/* Create Account */}
                    <div className="text-center">
                      <span className="text-[#403727] font-inter text-sm">
                        New to StoryBridge?{" "}
                        <button
                          onClick={handleSwitchToRegister}
                          className="text-[#C70000] hover:underline font-inter"
                        >
                          Create an account
                        </button>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            

            {/* Image Section - Fixed on desktop, full height (same as RegisterModal) */}
            <div className="flex-1 bg-[#805C2C] flex items-center justify-center p-4 md:p-8 order-1 md:order-2 md:sticky md:top-0 md:h-[90vh]">
              <div className="text-center w-full">
                <div className="flex justify-center">
                  <Image
                    src="/assets/images/login.png" 
                    alt="Young writer working with mentor"
                    width={400}
                    height={280}
                    className="rounded-lg object-cover h-auto w-full max-w-75 md:max-w-full"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;