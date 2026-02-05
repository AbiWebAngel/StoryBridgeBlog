// components/events/EventCardWithModal.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";

export interface EventData {
  id: number;
  title: string;
  date: Date | string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  fullDescription?: string;
  location?: string;
  category?: string;
  additionalInfo?: string[];
  registrationLink?: string;
}

interface EventCardWithModalProps {
  eventData: EventData[];
}

export default function EventCardWithModal({
  eventData,
}: EventCardWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const handleOpenModal = (event: EventData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // ⭐ MODAL COMPONENT — now using your exact full design
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

          {/* ⭐ FULL MODAL DESIGN (your exact structure copied) */}
          {selectedEvent && (
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

              {/* Hero Image */}
              <div className="relative h-64 md:h-80 rounded-[20px] overflow-hidden mb-8">
                <Image
                  src={selectedEvent.image.src}
                  alt={selectedEvent.image.alt || selectedEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>

              {/* Title */}
              <h2 className="font-cinzel font-bold text-[26px] text-[#000] uppercase">
                {selectedEvent.title}
              </h2>

              {/* Date + Location */}
              <div className="space-y-2 text-[#403F3C] font-jacques-francois text-[18px]">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedEvent.date instanceof Date
                    ? format(selectedEvent.date, "d MMMM yyyy")
                    : selectedEvent.date}
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedEvent.location}
                  </div>
                )}
              </div>

              {/* About This Event */}
              <div>
                <h3 className="font-cinzel font-bold text-[20px] text-[#000000] uppercase mb-2">
                  About This Event
                </h3>
                <p className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8]">
                  {selectedEvent.fullDescription ?? selectedEvent.description}
                </p>
              </div>

              {/* ⭐ SAFE optional chaining → no TypeScript errors */}
              {selectedEvent.additionalInfo?.length ? (
                <div>
                  <h3 className="font-cinzel font-bold text-[20px] uppercase mb-4">
                    Event Details
                  </h3>
                  <ul className="space-y-3">
                    {selectedEvent.additionalInfo.map((info, index) => (
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
              {selectedEvent.registrationLink && (
                <div className="pt-4">
                <a
                    href={selectedEvent.registrationLink}
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
      {/* Event cards */}
      <section className="w-full bg-[#D1BDA1] py-4 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {eventData.map((event) => {
            const formattedDate =
              event.date instanceof Date
                ? format(event.date, "d MMMM yyyy")
                : event.date;

            return (
              <article key={event.id} className="my-8">
                <div className="relative w-full h-[300px] sm:h-[350px] rounded-[30px] overflow-hidden shadow-xl bg-[#EDE5D8]">

                  <div className="h-full w-full p-6 sm:p-8 flex flex-col pr-0 sm:pr-[50%]">
                    <h3 className="font-cinzel font-bold !text-[22px] sm:text-[32px] text-[#000000] uppercase mb-2">
                      {event.title}
                    </h3>

                    <div className="mb-4">
                      <div className="flex items-center font-jacques-francois text-[18px] sm:text-[20px] text-[#403F3C]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formattedDate}
                      </div>

                      {event.location && (
                        <div className="flex items-center font-jacques-francois text-[16px] sm:text-[18px] text-[#403F3C] mt-1">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 mb-4 scrollable-description">
                      <p className="font-jacques-francois text-[16px] sm:text-[18px] text-[#403727] leading-[1.8]">
                        {event.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <button
                        onClick={() => handleOpenModal(event)}
                        className="font-jacques-francois text-[18px] bg-[#805C2C] text-white px-6 py-2 rounded-full hover:bg-[#6B4D24] transition-all duration-200"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>

                  {/* Card Image */}
                  <div className="absolute inset-y-0 right-0 w-[45%] hidden sm:block">
                    <div className="relative h-full w-full rounded-l-[24px] overflow-hidden shadow-lg">
                      <Image
                        src={event.image.src}
                        alt={event.image.alt || event.title}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Modal Rendering */}
      {isModalOpen && selectedEvent && <Modal />}
    </>
  );
}