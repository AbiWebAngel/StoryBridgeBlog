"use client";
import Image from "next/image";
import React from "react";
import ImageSlider from "./components/ImageSlider";
import {useState, FormEvent } from 'react';


export default function HomePage() {

const bookImages = [
  "/assets/images/book1.png",
  "/assets/images/book2.png",
  "/assets/images/book3.png",
  "/assets/images/book4.png",
];


  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

   // Frontend validation message
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

    // Server response message
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<boolean>(false);

 // Frontend validation function
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    handleValidation(value);

    // Clear server message when user starts typing
    if (serverMessage) {
      setServerMessage(null);
      setServerError(false);
    }
  };


  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
  e?.preventDefault();
  setTouched(true);

  // Prevent submission if frontend validation fails
  if (!isValid) {
    setMessage("Please enter a valid email address.");
    setIsError(true);
    return;
  }

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data: { success?: boolean; error?: string } = await res.json();

    if (res.ok && data.success) {
      // Use serverMessage for success
      setServerMessage("Subscribed successfully!");
      setServerError(false);

      // Reset input and frontend validation
      setEmail(""); 
      setTouched(false);
      setIsValid(null);
      setMessage(null);

      // Clear server message after 3 seconds
      setTimeout(() => {
        setServerMessage(null);
      }, 3000);
    } else {
      setMessage(data.error || "Something went wrong.");
      setIsError(true);
    }
  } catch (err) {
  setServerMessage("Unexpected error occurred. Please try again.");
  setServerError(true);
}

};


  return (
    <main>
    <h1 className="w-full mt-6 px-4 sm:px-6">
      <div className="mx-auto md:mx-0 md:ml-[3.5rem] md:mr-20 flex justify-center md:justify-start">
        <div className="w-full max-w-[550px]"> {/* keep original width ~526px */}
          <Image
            src="/assets/headings/MissionStatement.png"
            alt="Mission Statement"
            width={550}
            height={180}
            className="w-full h-auto"
          />
        </div>
      </div>
    </h1>

      <p className="mt-8 mb-4 px-4 sm:px-6 md:px-20 text-center md:text-left">
        StoryBridge is a youth-led initiative bringing young writers and readers together through storytelling,
        literacy projects and community connection.
      </p>

        {/* Image Slider */}
        <ImageSlider images={bookImages} />  

      <h1 className="w-full mt-12 px-4 sm:px-6">
        <div className="mx-auto md:mx-0 md:ml-[3.5rem] md:mr-20 flex justify-center md:justify-start">
          <div className="w-full max-w-[350px]"> 
            <Image
              src="/assets/headings/WhoWeAre.png"
              alt="Who We Are"
              width={350}
              height={180}
              quality={100}
              className="w-full h-auto"
            />
          </div>
        </div>
      </h1>

      <p className="mt-8 mb-4 px-4 sm:px-6 md:px-20 text-center md:text-left">
        Founded on the belief that stories can build bridges between people and communities,
        StoryBridge provides writers, especially teens, with resources to help them glow into
        their full potential!
      </p>

      {/* Paragraph Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mt-8 px-4 sm:px-6 md:px-20">
      {/* Column 1 */}
      <div className="flex flex-col items-center md:items-start">
        <div className="w-full max-w-[360px]">
          <Image
            src="/assets/headings/WhatWeDo.png"
            alt="What We Do"
            width={360}
            height={200}
            className="w-full h-auto"
          />
        </div>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-center md:text-left">
          We offer beta-reading services for novelists, a mentorship program for those just starting out, 
          and weekly competitions based on writing prompts to keep the creativity flowing.
        </p>

        <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mt-4">
          <Image
            src="/assets/images/PeopleAreDoingOnline.png"
            alt="People Are Doing Online"
            width={400}
            height={350}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col items-center md:items-start">
        <div className="w-full max-w-[450px]">
          <Image
            src="/assets/headings/WhyItMatters.png"
            alt="Why It Matters"
            width={450}
            height={200}
            className="w-full h-auto"
          />
        </div>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-center md:text-left">
          Young writers are often told to wait until they “grow up” before their words can make a difference. 
          At StoryBridge, we believe the opposite: every young person already has something worth saying, and writing is one of the most powerful ways to say it.
          StoryBridge matters because it gives teen writers a place to be heard, to share, and to connect. Writing isn’t just a skill — it’s a way of understanding the world, building empathy, and turning ideas into action.
          We’re not only encouraging better stories; we’re encouraging better storytellers, nurturing leaders, and supporting the authors of tomorrow, today.
        </p>
      </div>
    </div>




      {/* Newsletter Form */}
     <div className="relative w-full max-w-3xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <h1 className="relative">
        <Image
          src="/assets/headings/ReadOurNewsletter.png"
          alt="Read Our Newsletter"
          width={350}
          height={230}
          quality={100}
        />

        {/* Send Button */}
        <button
          type="submit"
          form="newsletter-form"
          className="bg-transparent transition hover:scale-110 hover:brightness-110 
                    absolute top-[3px] right-[-15px] sm:top-[-10px] sm:right-10px md:top-[-20px] md:right-[-50px] 
                    lg:top-[-35px] lg:right-[-160px] z-10"
        >
          <Image
            src="/assets/icons/Send.svg"
            alt="Send"
            width={300}
            height={200}
            className="w-35 h-21 sm:w-60 sm:h-20 md:w-64 md:h-24 lg:w-64 lg:h-31"
          />
        </button>
      </h1>

      {/* Form */}
      <form id="newsletter-form" className="w-full mt-10" onSubmit={handleSubmit}>
        <div className="w-full">
          <div
            className={`rounded-full border-5 shadow-md bg-transparent px-4 py-3 transition 
              ${
                touched
                  ? isValid
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-[#694D28]"
              }`}
          >
            <input
              type="email"
              value={email}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="myexampleemail@gmail.com"
              required
              className="w-full focus:outline-none bg-transparent text-[#202020] placeholder-[#4F4C48] border-b border-[#817C73] mt-2 font-inter text-sm sm:text-base"
            />
          </div>
          {/* Frontend validation message */}
          <div className="mt-2">
            {touched && message && (
              <p
                className={`text-sm font-medium transition-colors duration-200 ${
                  isError ? "text-red-500" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {/* Server response message */}
          <div className="mt-1">
            {serverMessage && (
              <p
                className={`text-sm font-medium transition-colors duration-200 ${
                  serverError ? "text-red-500" : "text-green-600"
                }`}
              >
                {serverMessage}
              </p>
            )}
            
          </div>
        </div>
      </form>
    </div>

    </main>
  );
}