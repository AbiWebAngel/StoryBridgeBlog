// components/LoginModal.tsx
"use client";
import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close Button - Outside the modal box */}
        <button
          onClick={onClose}
          className="absolute -top-12 -right-4 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="bg-white rounded-4xl overflow-hidden shadow-2xl">
          <div className="flex min-h-[600px]">
            {/* Left Section - Login Form */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* Heading */}
                <h2 className="text-[24px] text-[#000000] font-bold mb-8 text-center">
                  Login
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="rounded-full border-2 shadow-md bg-[#C6B49C] px-4 py-3 border-[#694D28]">
                    <div className="flex items-center">
                      {/* Email Icon */}
                      <div className="mr-3 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#403727" strokeWidth="2">
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
                        className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] mt-2 font-inter text-sm sm:text-base bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="rounded-full border-2 shadow-md bg-[#C6B49C] px-4 py-3 border-[#694D28]">
                    <div className="flex items-center">
                      {/* Password Icon */}
                      <div className="mr-3 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#403727" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] mt-2 font-inter text-sm sm:text-base bg-transparent"
                      />
                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="ml-3 flex-shrink-0 text-[#403727] hover:text-[#705431]"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  </div>
                  
                  {/* Forgot Password */}
                  <div className="text-right mt-2">
                    <button type="button" className="text-[#403727] text-sm hover:text-[#705431] transition-colors">
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#694D28] text-white rounded-[30px] font-bold hover:bg-[#705431] transition-colors text-sm mt-6"
                  >
                    Login
                  </button>
                </form>

                {/* Divider with Or */}
                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-[#403727]"></div>
                  <span className="flex-shrink mx-4 text-[#403727] text-sm">Or</span>
                  <div className="flex-grow border-t border-[#403727]"></div>
                </div>

                {/* Google Login Button */}
                <button className="w-full py-3 border-2 border-[#403727] rounded-[30px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm">
                  {/* Google Icon - Replace with your actual SVG import */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-[#403727] font-medium">Login with Google</span>
                </button>

                {/* Full Line Divider */}
                <div className="border-t border-[#403727] my-6"></div>

                {/* Create Account */}
                <div className="text-center">
                  <span className="text-[#403727] text-sm">
                    New to StoryBridge?{" "}
                    <button
                      onClick={handleSwitchToRegister}
                      className="text-[#C70000] hover:underline font-medium"
                    >
                      Create an account
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section - Background with Image */}
            <div className="flex-1 bg-[#705431] flex items-center justify-center p-8">
              <div className="text-center">
                {/* Replace with your actual image import */}
                <div className="mb-4 flex justify-center">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#C6B49C" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#C6B49C] mb-2">Welcome Back</h3>
                <p className="text-[#C6B49C]">Continue your journey with StoryBridge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;