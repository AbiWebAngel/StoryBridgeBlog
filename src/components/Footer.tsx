const Footer = () => {
  return (
    <footer className="footer-brand-dark py-4 px-6 flex flex-col md:flex-row text-center md:text-left md:justify-between gap-2 md:gap-0 w-full">
      {/* Left side */}
      <div className="text-[20px] md:text-[20px] font-bold tracking-wide">
        StoryBridge
        
        <div className="footer-contact">
          Contact us:{" "}
          <a 
            href="mailto:storybridgeteens@gmail.com" 
            className="relative group inline-block"
          >
            <span className="relative">
              storybridgeteens@gmail.com
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </span>
          </a>
        </div>
      </div>

      {/* Right side - with light italic styling */}
      <div className="text-[19px] md:text-[20px] font-light italic">
        <div className="footer-contact">
          <div className="inline-block text-right w-32">Designed by:</div>
          <a 
            href="https://www.linkedin.com/in/anna-k-7b5a4b276/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative group ml-2 inline-block"
          >
            <span className="relative">
              Anna Kutova
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </span>
          </a>
        </div>
        <div className="footer-contact">
          <div className="inline-block text-right w-34">Developed by:</div>
          <a 
            href="https://theprince05.github.io/PrinceTheKingPortfolio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative group ml-2 inline-block"
          >
            <span className="relative">
              Prince Sithole
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;