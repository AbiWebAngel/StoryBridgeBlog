const Footer = () => {
  return (
    <footer className="footer-brand-dark py-4 px-6 flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0 w-full">
      {/* Left side */}
      <div className="text-[20px] md:text-[20px] font-bold tracking-wide">
        StoryBridge
      </div>

      {/* Right side */}
      <div className="text-[19px] md:text-[20px] font-bold text-center md:text-right footer-contact">
        Contact us:{" "}
        <a href="mailto:storybridgeteens@gmail.com" className="hover:underline">
          storybridgeteens@gmail.com
        </a>
      </div>
    </footer>
  );
};


export default Footer;
