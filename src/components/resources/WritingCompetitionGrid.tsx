// components/resources/WritingCompetitionsGrid.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { WritingCompetition } from "@/types/resources";

interface WritingCompetitionsGridProps {
  competitions: WritingCompetition[];
}

// Helper function to format date in "6 Feb 2026" format
const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return "No deadline set";
  
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";
  
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`; // "6 Feb 2026"
};

export default function WritingCompetitionsGrid({ 
  competitions 
}: WritingCompetitionsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<WritingCompetition | null>(null);

  const handleOpenModal = (competition: WritingCompetition) => {
    setSelectedCompetition(competition);
    setIsModalOpen(true);
  };

  if (!competitions || competitions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No writing competitions available at the moment.</p>
      </div>
    );
  }

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
        <div className="relative bg-white rounded-[30px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {selectedCompetition && (
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

              {/* Image */}
              {selectedCompetition.image?.src && (
                <div className="relative h-64 w-full rounded-[20px] overflow-hidden mb-6">
                  <Image
                    src={selectedCompetition.image.src}
                    alt={selectedCompetition.image.alt || selectedCompetition.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="font-cinzel font-bold text-[26px] text-[#000] uppercase">
                {selectedCompetition.title}
              </h2>

              {/* Deadline, Prize & Entry Fee */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#403F3C] font-jacques-francois text-[18px]">
                <div className="flex items-center bg-[#F8F4EC] rounded-[15px] p-4">
                  <svg className="w-6 h-6 mr-3 text-[#805C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className="font-semibold">
                      {formatDate(selectedCompetition.deadline)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-[#F8F4EC] rounded-[15px] p-4">
                  <svg className="w-6 h-6 mr-3 text-[#805C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Prize</div>
                    <div className="font-semibold">{selectedCompetition.prize}</div>
                  </div>
                </div>

                <div className="flex items-center bg-[#F8F4EC] rounded-[15px] p-4">
                  <svg className="w-6 h-6 mr-3 text-[#805C2C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Entry Fee</div>
                    <div className="font-semibold">{selectedCompetition.entryFee}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-cinzel font-bold text-[20px] text-[#000000] uppercase mb-2">
                  About the Competition
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedCompetition.description}
                </p>
              </div>

              {/* Eligibility */}
              <div className="bg-[#F8F4EC] rounded-[20px] p-6">
                <h3 className="font-cinzel font-bold text-[18px] text-[#000000] uppercase mb-2">
                  Eligibility
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedCompetition.eligibility}
                </p>
              </div>

              {/* Rules */}
              <div className="bg-[#F8F4EC] rounded-[20px] p-6">
                <h3 className="font-cinzel font-bold text-[18px] text-[#000000] uppercase mb-4">
                  Competition Rules
                </h3>
                <ul className="space-y-3">
                  {selectedCompetition.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-6 h-6 text-[#403727] mt-1 mr-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        />
                      </svg>
                      <span className="font-jacques-francois text-[18px] text-[#403727]">
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {selectedCompetition.registrationLink && (
                <div className="pt-4 text-center">
                  <a
                    href={selectedCompetition.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-8 py-3 font-jacques-francois text-[20px] bg-[#805C2C] text-white rounded-full hover:bg-[#6B4D24] transition-all duration-200"
                  >
                    Register Now
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
      {/* Writing Competitions Grid */}
      <section className="w-full bg-[#D6C6AE] py-12 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mobile View - Single Column */}
          <div className="sm:hidden space-y-6">
            {competitions.map((competition) => (
              <article
                key={competition.id}
                className="bg-white rounded-[24px] shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200"
                onClick={() => handleOpenModal(competition)}
              >
                {/* Image */}
                <div className="relative h-48 w-full rounded-[15px] overflow-hidden mb-4">
                  {competition.image?.src ? (
                    <Image
                      src={competition.image.src}
                      alt={competition.image.alt || competition.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Image coming soon</span>
                    </div>
                  )}
                  {/* Deadline Badge */}
                  <div className="absolute top-3 right-3 bg-[#805C2C] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {formatDate(competition.deadline)}
                  </div>
                </div>

                <h3 className="font-cinzel font-bold text-[20px] text-[#000] uppercase mb-3">
                  {competition.title}
                </h3>
                
                {/* Prize & Entry Fee */}
                <div className="flex justify-between items-center mb-4 text-[#805C2C] font-jacques-francois text-[16px]">
                  <div className="font-semibold">{competition.prize}</div>
                  <div className="font-medium">{competition.entryFee}</div>
                </div>

                <p className="font-jacques-francois text-[16px] text-[#403727] mb-6 leading-[1.6] line-clamp-3">
                  {competition.description}
                </p>

                <div className="space-y-4 pt-4 border-t border-[#D1BDA1]">
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Eligibility
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727] line-clamp-2">
                      {competition.eligibility}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(competition);
                  }}
                  className="mt-6 w-full bg-[#805C2C] text-white px-6 py-3 rounded-full font-jacques-francois text-[16px] hover:bg-[#6B4D24] transition-all duration-200"
                >
                  View Details
                </button>
              </article>
            ))}
          </div>

          {/* Desktop View - 3 Cards per Row */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitions.map((competition) => (
              <article
                key={competition.id}
                className="bg-white rounded-[24px] shadow-lg p-6 flex flex-col cursor-pointer hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300"
                onClick={() => handleOpenModal(competition)}
              >
                {/* Image */}
                <div className="relative h-48 w-full rounded-[15px] overflow-hidden mb-4">
                  {competition.image?.src ? (
                    <Image
                      src={competition.image.src}
                      alt={competition.image.alt || competition.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Image coming soon</span>
                    </div>
                  )}
                  {/* Deadline Badge */}
                  <div className="absolute top-3 right-3 bg-[#805C2C] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {formatDate(competition.deadline)}
                  </div>
                </div>

                <h3 className="font-cinzel font-bold text-[20px] text-[#000] uppercase mb-3 line-clamp-2">
                  {competition.title}
                </h3>
                
                {/* Prize & Entry Fee */}
                <div className="flex justify-between items-center mb-4 text-[#805C2C] font-jacques-francois text-[16px]">
                  <div className="font-semibold">{competition.prize}</div>
                  <div className="font-medium">{competition.entryFee}</div>
                </div>

                <p className="font-jacques-francois text-[16px] text-[#403727] mb-6 leading-[1.6] flex-grow line-clamp-3">
                  {competition.description}
                </p>

                <div className="space-y-4 pt-4 border-t border-[#D1BDA1]">
                  <div>
                    <h4 className="font-cinzel font-bold text-[16px] text-[#000] uppercase mb-1">
                      Eligibility
                    </h4>
                    <p className="font-jacques-francois text-[15px] text-[#403727] line-clamp-2">
                      {competition.eligibility}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(competition);
                  }}
                  className="mt-6 bg-[#805C2C] text-white px-6 py-3 rounded-full font-jacques-francois text-[16px] hover:bg-[#6B4D24] transition-all duration-200"
                >
                  View Details
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Rendering */}
      {isModalOpen && selectedCompetition && <Modal />}
    </>
  );
}