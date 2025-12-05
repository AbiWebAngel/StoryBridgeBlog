"use client";

interface MentorshipButtonProps {
  type: 'mentor' | 'mentee';
  buttonText?: string;
  customUrl?: string;
  className?: string;
}

export default function MentorshipButton({ 
  type,
  buttonText = "Get Started",
  customUrl,
  className = ""
}: MentorshipButtonProps) {
  
  const handleClick = () => {
    let url;
    
    if (customUrl) {
      url = customUrl;
    } else if (type === 'mentor') {
      url = process.env.NEXT_PUBLIC_BECOMING_MENTOR_FORM_URL;
    } else {
      url = process.env.NEXT_PUBLIC_FINDING_MENTOR_FORM_URL;
    }
    
    if (url) {
      window.open(url, "_blank");
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