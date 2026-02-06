// components/summer-programs/SummerProgramsGrid.tsx
"use client";

import React, { useState } from "react";

export interface SummerProgramData {
  id: number;
  title: string;
  duration: string;
  location: string; // Added location field
  shortDescription: string;
  fullDescription: string;
  bestFor: string;
  outcome: string;
  additionalInfo?: string[];
  registrationLink?: string;
  category?: string;
}

interface SummerProgramsGridProps {
  programsData: SummerProgramData[];
}

export default function SummerProgramsGrid({
  programsData,
}: SummerProgramsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<SummerProgramData | null>(null);

  const handleOpenModal = (program: SummerProgramData) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  // Modal Component
  const Modal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000]/60 transition-opacity"
        onClick={() => setIsModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-[#EDE5D8] rounded-[30px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollable-description">
          {selectedProgram && (
            <div className="p-6 sm:p-10 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 z-10 p-2.5 bg-[#D1BDA1]/40 text-[#403727] rounded-full hover:bg-[#805C2C] hover:text-white transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Title */}
              <h2 className="font-cinzel font-bold text-[26px] text-[#000] uppercase">
                {selectedProgram.title}
              </h2>

              {/* Duration and Location */}
              <div className="space-y-2 text-[#403F3C] font-jacques-francois text-[18px]">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedProgram.duration}
                </div>

                {/* Location */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedProgram.location}
                </div>

                {selectedProgram.category && (
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {selectedProgram.category}
                  </div>
                )}
              </div>

              {/* Best For Section */}
              <div className="bg-[#F8F4EC] rounded-[20px] p-6">
                <h3 className="font-cinzel font-bold text-[18px] text-[#000000] uppercase">
                  Best For
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedProgram.bestFor}
                </p>
              </div>

              {/* Expected Outcome */}
              <div className="bg-[#F8F4EC] rounded-[20px] p-6">
                <h3 className="font-cinzel font-bold text-[18px] text-[#000000] uppercase">
                  Expected Outcome
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedProgram.outcome}
                </p>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="font-cinzel font-bold text-[20px] text-[#000000] uppercase mb-2">
                  Program Details
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedProgram.fullDescription}
                </p>
              </div>

              {/* Additional Information */}
              {selectedProgram.additionalInfo?.length ? (
                <div>
                  <h3 className="font-cinzel font-bold text-[20px] uppercase mb-4">
                    What You'll Get
                  </h3>
                  <ul className="space-y-3">
                    {selectedProgram.additionalInfo.map((info, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-6 h-6 text-[#403727] mt-1 mr-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          />
                        </svg>
                        <span className="font-jacques-francois text-[18px] text-[#403727]">
                          {info}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* CTA */}
              {selectedProgram.registrationLink && (
                <div className="pt-4">
                  <a
                    href={selectedProgram.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-3 font-jacques-francois text-[20px] bg-[#805C2C] text-white rounded-full hover:bg-[#6B4D24] transition-all duration-200"
                  >
                    Apply Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-[#D1BDA1]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full md:w-auto px-8 py-3 font-jacques-francois text-[20px] bg-[#805C2C] text-white rounded-full hover:bg-[#6B4D24] transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Summer Programs Grid */}
      <section className="w-full bg-[#D6C6AE] py-12 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile View - Single Column */}
          <div className="sm:hidden space-y-6">
            {programsData.map((program) => (
              <article
                key={program.id}
                className="bg-[#EDE5D8] rounded-[24px] shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                onClick={() => handleOpenModal(program)}
              >
                <h3 className="font-cinzel font-bold text-[20px] text-[#000] uppercase mb-3">
                  {program.title}
                </h3>
                
                {/* Duration and Location */}
                <div className="space-y-2 text-[#805C2C] font-jacques-francois text-[16px] mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {program.duration}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {program.location}
                  </div>
                </div>

                <p className="font-jacques-francois text-[16px] text-[#403727] mb-6 leading-[1.6]">
                  {program.shortDescription}
                </p>

                <div className="space-y-4 pt-4 border-t border-[#D1BDA1]">
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Best for
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727]">
                      {program.bestFor}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Outcome
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727]">
                      {program.outcome}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(program);
                  }}
                  className="mt-6 w-full bg-[#805C2C] text-white px-6 py-3 rounded-full font-jacques-francois text-[16px] hover:bg-[#6B4D24] transition-all duration-200"
                >
                  Learn More
                </button>
              </article>
            ))}
          </div>

          {/* Desktop View - 3 Cards per Row */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programsData.map((program) => (
              <article
                key={program.id}
                className="bg-[#EDE5D8] rounded-[24px] shadow-lg p-6 flex flex-col cursor-pointer hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
                onClick={() => handleOpenModal(program)}
              >
                <h3 className="font-cinzel font-bold text-[20px] text-[#000] uppercase mb-3 line-clamp-2">
                  {program.title}
                </h3>
                
                {/* Duration and Location */}
              <div className="space-y-2 text-[#403727] font-jacques-francois text-[16px] mb-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {program.duration}
                </div>
                
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {program.location}
                </div>
                </div>

                <p className="font-jacques-francois text-[16px] text-[#403727] mb-6 leading-[1.6] flex-grow line-clamp-4">
                  {program.shortDescription}
                </p>

                <div className="space-y-4 pt-4 border-t border-[#D1BDA1]">
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Best for
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727] line-clamp-2">
                      {program.bestFor}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Outcome
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727] line-clamp-2">
                      {program.outcome}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(program);
                  }}
                  className="mt-6 bg-[#805C2C] text-white px-6 py-3 rounded-full font-jacques-francois text-[16px] hover:bg-[#6B4D24] transition-all duration-200"
                >
                  Learn More
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Rendering */}
      {isModalOpen && selectedProgram && <Modal />}
    </>
  );
}