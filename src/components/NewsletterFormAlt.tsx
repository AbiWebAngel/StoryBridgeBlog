"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";

export default function NewsletterFormAlt() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  // Frontend validation
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Server response
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState(false);

  // Validate email on change or submit
  const handleValidation = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      setIsValid(false);
      setIsError(true);
      setMessage("Email is required.");
    } else if (!regex.test(value)) {
      setIsValid(false);
      setIsError(true);
      setMessage("Please enter a valid email address.");
    } else {
      setIsValid(true);
      setIsError(false);
      setMessage("Looks good!");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    handleValidation(value);

    if (serverMessage) {
      setServerMessage(null);
      setServerError(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setServerMessage("✅ Thanks for subscribing!");
      setServerError(false);

      setEmail("");
      setTouched(false);
      setIsValid(null);
      setMessage(null);

      setTimeout(() => setServerMessage(null), 3000);
    } catch (err) {
      setServerMessage("Unexpected error occurred. Please try again.");
      setServerError(true);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="relative">
        {/* 👀 Visually hidden SEO text */}
        <span className="sr-only">Like what you read? Sign up for our newsletter to always stay up-to-date with all things storybridge.</span>

        {/* Image Heading */}
        <Image
          src="/assets/headings/blog/SignUp2.png"
          alt="Sign Up for Newsletter"
          width={400}
          height={230}
          quality={100}
        />

        {/* Send Button */}
        <button
          type="submit"
          form="newsletter-form"
          className="absolute top-[90px] right-[-15px] sm:top-[90px] sm:right-10 md:top-[80px] md:right-[-20px] lg:top-[60px] lg:right-[-150px] z-10 bg-transparent transition hover:scale-102 hover:brightness-110 cursor-pointer"
        >
          <Image
            src="/assets/icons/Send.svg"
            alt="Send"
            width={300}
            height={200}
            className="w-40 h-21 sm:w-52 sm:h-20 md:w-52 md:h-24 lg:w-60 lg:h-31"
          />
        </button>
      </h1>

      {/* Form */}
      <form
        id="newsletter-form"
        className="w-full mt-10"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="w-full">
          <div
            className={`rounded-full border-5 shadow-md bg-[#C6B49C] px-4 py-3 transition ${
              touched
                ? isValid
                  ? "border-green-500"
                  : "border-red-500"
                : "border-[#805C2C]"
            }`}
          >
            <input
              type="email"
              value={email}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="myexampleemail@gmail.com"
              required
              className="w-full focus:outline-none  text-[#403727] font-bold placeholder-[#403727] border-b-2 border-[#403727] mt-2 font-inter text-sm sm:text-base"
            />
          </div>

          {/* Frontend validation message */}
          {touched && message && (
            <p
              className={`mt-2 text-sm font-medium transition-colors duration-200 ${
                isError ? "text-red-500" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Server response message */}
          {serverMessage && (
            <p
              className={`mt-1 text-sm font-medium transition-colors duration-200 ${
                serverError ? "text-red-500" : "text-green-600"
              }`}
            >
              {serverMessage}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
