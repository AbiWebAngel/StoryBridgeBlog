// components/events/EventCardWithModal.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: Date | string;
    description: string;
    imageUrl: string;
    fullDescription?: string;
    location?: string;
    category?: string;
    imageAlt?: string;
    additionalInfo?: string[];
    registrationLink?: string;
  };
}

export default function EventCardWithModal({ event }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format the date
  const formattedDate = event.date instanceof Date 
    ? format(event.date, 'MMMM d, yyyy')
    : event.date;

  return (
    <>
      {/* Container matching OurTeam styling */}
      <div className="w-full bg-[#D1BDA1] py-8 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Event Card - Wrapped in container like OurTeam */}
          <div className="flex w-full h-[300px] sm:h-[350px] rounded-l-[30px] overflow-hidden shadow-xl">
            {/* Text Section - Left side (3/4) - Straight left side, rounded right corners */}
            <div className="w-3/4 bg-[#EDE5D8] p-6 sm:p-8 flex flex-col">
              {/* Event Title */}
              <h3 className="font-cinzel font-bold !text-[22px] sm:text-[32px] text-[#000000] uppercase mb-2">
                {event.title}
              </h3>
              
              {/* Event Date */}
              <div className="mb-4">
                <div className="flex items-center font-jacques-francois text-[18px] sm:text-[20px] text-[#403F3C]">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                </div>
                
                {/* Event Location */}
                {event.location && (
                  <div className="flex items-center font-jacques-francois text-[16px] sm:text-[18px] text-[#403F3C] mt-1">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                )}
              </div>
              
              {/* Description Preview - Scrollable */}
              <div className="flex-1 overflow-y-auto pr-2 scrollable-description mb-4">
                <p className="font-jacques-francois text-[16px] sm:text-[18px] text-[#403727] leading-[1.8]">
                  {event.description}
                </p>
              </div>
              
              {/* Learn More Button */}
              <div className="mt-auto">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="font-jacques-francois text-[18px] text-[#403727] px-6 py-2 border-2 border-[#403727] rounded-full hover:bg-[#403727] hover:text-[#EDE5D8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#403727] focus:ring-offset-2"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Image Section - Right side (1/4) - Rounded left corners, straight right side */}
            <div className="w-1/4 relative h-full">
              <Image
                src={event.imageUrl}
                alt={event.imageAlt || event.title}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Updated to match theme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-[#EDE5D8] rounded-[30px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 z-10 p-2 text-[#403727] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#403727] rounded-full"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <div className="p-6 md:p-8">
                {/* Modal Image - Full width */}
                <div className="relative h-64 md:h-80 rounded-[20px] overflow-hidden mb-8">
                  <Image
                    src={event.imageUrl}
                    alt={event.imageAlt || event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>

                {/* Modal Header */}
                <div className="mb-8">
                  {/* Title */}
                  <h2 className="font-cinzel font-bold text-[22px] text-[#000000] uppercase mb-4">
                    {event.title}
                  </h2>
                  
                  {/* Date and Location */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center font-jacques-francois text-[20px]  text-[#403F3C]">
                      <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formattedDate}
                    </div>
                    {event.location && (
                      <div className="flex items-center font-jacques-francois text-[18px]  text-[#403F3C]">
                        <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                  </div>
                  
                  {/* Category badge */}
                  {event.category && (
                    <span className="inline-block px-4 py-2 font-jacques-francois text-[16px] text-[#403727] bg-[#D1BDA1] rounded-full">
                      {event.category}
                    </span>
                  )}
                </div>

                {/* Modal Body */}
                <div className="space-y-8">
                  {/* Full Description */}
                  <div>
                    <h3 className="font-cinzel font-bold text-[20px] text-[#000000] uppercase mb-4">
                      About This Event
                    </h3>
                    <div className="font-jacques-francois text-[18px] text-[#403727] leading-[1.8] space-y-4">
                      {event.fullDescription ? (
                        <p>{event.fullDescription}</p>
                      ) : (
                        <p>{event.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  {event.additionalInfo && event.additionalInfo.length > 0 && (
                    <div>
                      <h3 className="font-cinzel font-bold text-[20px] text-[#000000] uppercase mb-4">
                        Event Details
                      </h3>
                      <ul className="space-y-3">
                        {event.additionalInfo.map((info, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-6 h-6 text-[#403727] mt-1 mr-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-jacques-francois text-[18px] text-[#403727]">{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Registration Link */}
                  {event.registrationLink && (
                    <div className="pt-4">
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-3 font-jacques-francois text-[20px] text-[#EDE5D8] bg-[#403727] rounded-full hover:bg-[#000000] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#403727] focus:ring-offset-2"
                      >
                        Register Now
                        <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-12 pt-8 border-t border-[#D1BDA1]">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full md:w-auto px-8 py-3 font-jacques-francois text-[18px] text-[#403727] bg-[#D1BDA1] rounded-full hover:bg-[#EDE5D8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#403727] focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}