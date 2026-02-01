"use client";

interface MentorshipButtonProps {
  type: 'mentor' | 'mentee';
  buttonText?: string;
  customUrl?: string;
  className?: string;
  buttonUrl?: string;
}

export default function MentorshipButton({ 
  type,
  buttonText = "Get Started",
  buttonUrl,
  className = ""
}: MentorshipButtonProps) {
  
  const handleClick = () => {
    
    if (buttonUrl) {
      // If admin has provided a custom URL, use it
      window.open(buttonUrl, "_blank");
    } else {
          const fallbackUrls = {
        mentor: "/apply",  // Replace with actual default if needed
        mentee: "/apply"   // Replace with actual default if needed
      };
    
      const url = fallbackUrls[type];
      if (url) {
        window.open(url, "_blank");
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-[#805E2D] text-white text-[18px] px-8 py-3 rounded-[30px] hover:bg-[#6B4D23] transition-colors flex items-center justify-center hover:scale-105 ${className}`}
    >
      <span className="translate-y-[1.5px]">{buttonText}</span>
    </button>
  );
}