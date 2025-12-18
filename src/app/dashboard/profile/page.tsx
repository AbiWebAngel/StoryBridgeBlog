"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { validateName } from "@/utils/validators";

export default function ProfilePage() {
  const { user } = useAuth();


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
  });

  // Populate fields when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      firstName: "",
      lastName: "",
    };

    // Validate first name
    const firstNameError = validateName(firstName);
    if (firstNameError) {
      errors.firstName = firstNameError;
      isValid = false;
    }

    // Validate last name
    const lastNameError = validateName(lastName);
    if (lastNameError) {
      errors.lastName = lastNameError;
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Clear previous messages
    setSuccessMessage("");
    setErrorMessage("");

    // Validate form
    if (!validateForm()) {
      setErrorMessage("Please fix the errors in the form.");
      return;
    }

    // Check if anything has actually changed
    if (firstName === user.firstName && lastName === user.lastName) {
      setErrorMessage("No changes detected.");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { firstName, lastName });

      setSuccessMessage("Profile updated successfully!");
      
      // Clear any existing validation errors
      setValidationErrors({
        firstName: "",
        lastName: "",
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time validation on blur
  const handleFirstNameBlur = () => {
    const error = validateName(firstName);
    setValidationErrors(prev => ({ ...prev, firstName: error || "" }));
  };

  const handleLastNameBlur = () => {
    const error = validateName(lastName);
    setValidationErrors(prev => ({ ...prev, lastName: error || "" }));
  };

  if (!user) {
    return (      <div className="min-h-screen flex items-center justify-center text-[#4A3820]">
        Please log in to view your profile.

      </div>
    );
  }

  return (    <div className="min-h-screen px-6 !font-sans">
      <div className="max-w-md mx-auto">

        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          My Profile
        </h1>
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          <h1 className={`text-2xl !font-sans font-medium text-[#4A3820] mb-6`}>
            Profile Information
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

          <form onSubmit={handleSave} className="space-y-6">
            {/* Email - Can't be changed */}
            <div>
              <div className="rounded-full border-4 shadow-md px-4 py-2 border-[#805C2C] w-full">
                <div className="flex items-center">
                  {/* Email Icon */}
                  <div className="mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#403727">
                      <path d="M172.31-180Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21H172.31ZM480-457.69L160-662.31v410q0 5.39 3.46 8.85t8.85 3.46h615.38q5.39 0 8.85-3.46t3.46-8.85v-410L480-457.69Zm0-62.31l313.85-200h-627.7L480-520ZM160-662.31V-720v467.69q0 5.39 3.46 8.85t8.85 3.46H160v-422.31Z"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    disabled
                    className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] !font-sans text-base md:text-lg bg-transparent opacity-70 cursor-not-allowed"
                    required
                  />
                </div>
              </div>
              {/* Change email message - placed directly below the email field */}
              <p className="!text-base text-black mt-2 ml-3">
                To change your email, please use the "Change Email" section.
              </p>
            </div>

            {/* FIRST NAME */}
            <div>
              <div className={`rounded-full border-4 shadow-md px-4 py-2 w-full ${
                validationErrors.firstName 
                  ? "border-red-500" 
                  : "border-[#805C2C]"
              }`}>
                <div className="flex items-center">
                  {/* First Name Icon */}
                  <div className="mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#403727">
                      <path d="M480-492.31q-57.75 0-98.87-41.12Q340-574.56 340-632.31q0-57.75 41.13-98.87 41.12-41.13 98.87-41.13 57.75 0 98.87 41.13Q620-690.06 620-632.31q0 57.75-41.13 98.88-41.12 41.12-98.87 41.12ZM180-187.69v-88.93q0-29.38 15.96-54.42 15.96-25.04 42.66-38.5 59.3-29.07 119.65-43.61 60.35-14.54 121.73-14.54t121.73 14.54q60.35 14.54 119.65 43.61 26.7 13.46 42.66 38.5Q780-306 780-276.62v88.93H180Zm60-60h480v-28.93q0-12.15-7.04-22.5-7.04-10.34-19.11-16.88-51.7-25.46-105.42-38.58Q534.7-367.69 480-367.69q-54.7 0-108.43 13.11-53.72 13.12-105.42 38.58-12.07 6.54-19.11 16.88-7.04 10.35-7.04 22.5v28.93Zm240-304.62q33 0 56.5-23.5t23.5-56.5q0-33-23.5-56.5t-56.5-23.5q-33 0-56.5 23.5t-23.5 56.5q0 33 23.5 56.5t56.5 23.5Zm0-80Zm0 384.62Z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={handleFirstNameBlur}
                    placeholder="First Name"
                    className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] !font-sans text-base md:text-lg bg-transparent"
                    required
                  />
                </div>
              </div>
              {/* Validation error for first name */}
              {validationErrors.firstName && (
                <p className="text-red-600 text-sm mt-1 ml-3">
                  {validationErrors.firstName}
                </p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <div className={`rounded-full border-4 shadow-md px-4 py-2 w-full ${
                validationErrors.lastName 
                  ? "border-red-500" 
                  : "border-[#805C2C]"
              }`}>
                <div className="flex items-center">
                  {/* Last Name Icon */}
                  <div className="mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#403727">
                      <path d="M480-492.31q-57.75 0-98.87-41.12Q340-574.56 340-632.31q0-57.75 41.13-98.87 41.12-41.13 98.87-41.13 57.75 0 98.87 41.13Q620-690.06 620-632.31q0 57.75-41.13 98.88-41.12 41.12-98.87 41.12ZM180-187.69v-88.93q0-29.38 15.96-54.42 15.96-25.04 42.66-38.5 59.3-29.07 119.65-43.61 60.35-14.54 121.73-14.54t121.73 14.54q60.35 14.54 119.65 43.61 26.7 13.46 42.66 38.5Q780-306 780-276.62v88.93H180Zm60-60h480v-28.93q0-12.15-7.04-22.5-7.04-10.34-19.11-16.88-51.7-25.46-105.42-38.58Q534.7-367.69 480-367.69q-54.7 0-108.43 13.11-53.72 13.12-105.42 38.58-12.07 6.54-19.11 16.88-7.04 10.35-7.04 22.5v28.93Zm240-304.62q33 0 56.5-23.5t23.5-56.5q0-33-23.5-56.5t-56.5-23.5q-33 0-56.5 23.5t-23.5 56.5q0 33 23.5 56.5t56.5 23.5Zm0-80Zm0 384.62Z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={handleLastNameBlur}
                    placeholder="Last Name"
                    className="w-full focus:outline-none text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] !font-sans text-base md:text-lg bg-transparent"
                    required
                  />
                </div>
              </div>
              {/* Validation error for last name */}
              {validationErrors.lastName && (
                <p className="text-red-600 text-sm mt-1 ml-3">
                  {validationErrors.lastName}
                </p>
              )}
            </div>

            {/* SAVE BUTTON - Smaller width */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-8  !font-sans bg-[#805C2C] text-[#FFFFFF] rounded-[30px] hover:bg-[#705431] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base md:text-lg w-auto"
              >
                <span className="text-[#FFFFFF] font-medium">
                  {loading ? "Saving..." : "Save Changes"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}