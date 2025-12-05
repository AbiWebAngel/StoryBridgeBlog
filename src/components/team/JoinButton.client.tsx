"use client";

interface JoinButtonProps {
  buttonText?: string;
  buttonUrl?: string;
  onButtonClick?: () => void;
}

export default function JoinButton({ 
  buttonText = "Join Us", 
  buttonUrl, 
  onButtonClick 
}: JoinButtonProps) {
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonUrl) {
      window.open(buttonUrl, "_blank");
    } else if (process.env.NEXT_PUBLIC_JOIN_US_FORM_URL) {
      window.open(process.env.NEXT_PUBLIC_JOIN_US_FORM_URL, "_blank");
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      className="bg-[#805E2D] text-white text-[18px] px-8 py-3 rounded-[30px] hover:bg-[#6B4D23] transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
    >
      <span className="translate-y-[1.5px]">{buttonText}</span>
    </button>
  );
}