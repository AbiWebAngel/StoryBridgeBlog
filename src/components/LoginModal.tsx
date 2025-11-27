// components/LoginModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", formData);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close Button - Original position for desktop, mobile optimized */}
        <button
          onClick={onClose}
          className="absolute -top-10 -right-2 md:-top-8 md:-right-4 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="bg-[#EDE5D8] rounded-3xl md:rounded-4xl overflow-hidden shadow-2xl border-2 border-[#EDE5D8] max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row min-h-[500px] md:min-h-[600px]">
            {/* Image Section - Now on top for mobile, right for desktop */}
            <div className="flex-1 bg-[#694D28] flex items-center justify-center p-4 md:p-8 order-1 md:order-2">
              <div className="text-center w-full">
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/assets/images/login.png" 
                    alt="Young writer working with mentor"
                    width={400}
                    height={280}
                    className="rounded-lg object-cover h-auto w-full max-w-[300px] md:max-w-full"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Form Section - Now below for mobile, left for desktop */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center order-2 md:order-1">
              <div className="max-w-md mx-auto w-full">
                {/* Heading */}
                <h2 className="text-[20px] md:text-[24px] font-inter text-[#000000] font-bold mb-6 md:mb-8">
                  Login
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Email Field - Updated for consistent width */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full border-4 shadow-md px-4 py-2 border-[#694D28]">
                      <div className="flex items-center">
                        {/* Email Icon */}
                        <div className="mr-3 flex-shrink-0">
                          <svg width="20" height="20" className="md:w-[25px] md:h-[25px]" viewBox="0 0 24 24" fill="none" stroke="#403727" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email"
                          className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] font-inter text-base md:text-lg bg-transparent"
                        />
                      </div>
                    </div>
                    {/* Consistent spacer for both fields */}
                    <div className="flex-shrink-0 w-[44px] md:w-[52px]"></div>
                  </div>

                  {/* Password Field */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-full border-4 shadow-md px-4 py-2 border-[#694D28]">
                      <div className="flex items-center">
                        {/* Password Icon */}
                        <div className="mr-1 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24" className="md:h-[30px]" viewBox="0 -960 960 960" width="24" fill="#403727">
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
                        />
                      </div>
                    </div>
                    
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="flex-shrink-0 text-[#403727] hover:text-[#705431] p-2 h-[44px] w-[44px] md:h-[52px] md:w-[52px] flex items-center justify-center"
                    >
                      <svg width="20" height="20" className="md:w-[25px] md:h-[25px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <button type="button" className="text-[#403727] font-inter text-base md:text-lg hover:text-[#705431] transition-colors">
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3 font-inter bg-[#694D28] text-[#FFFFFF] rounded-[30px] hover:bg-[#705431] transition-colors text-base md:text-lg mt-4 md:mt-6"
                  >
                     <span className="text-[#FFFFFF] font-medium">Login</span>
                  </button>
                </form>

                {/* Divider with Or */}
                <div className="relative flex items-center my-4 md:my-6">
                  <div className="flex-grow border-1 border-[#403727]"></div>
                  <span className="flex-shrink mx-4 text-[#403727] font-inter text-sm font-bold">Or</span>
                  <div className="flex-grow border-1 border-[#403727]"></div>
                </div>

                {/* Google Login Button */}
                <button className="w-full py-3 border-[#403727] rounded-[30px] flex items-center justify-center gap-3 bg-[#694D28] hover:bg-[#705431] transition-colors text-base md:text-lg font-inter">
                  <svg width="18" height="18" className="md:w-[20px] md:h-[20px]" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-[#FFFFFF] font-medium">Login with Google</span>
                </button>

                {/* Full Line Divider */}
                <div className="border-1 border-[#403727] my-4 md:my-6"></div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;