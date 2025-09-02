// src/components/Footer.tsx
const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white py-4 px-6 flex justify-between items-center fixed bottom-0 left-0 w-full">
            {/* Left side */}
            <div className="text-[30px] font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                StoryBridge
            </div>

            {/* Right side */}
            <div className="text-sm text-[16px] font-bold" style={{ fontFamily: 'inter, serif' }}>
                Contact us:{" "}
                <a
                    href="mailto:storybridgeteens@gmail.com"
                    className="hover:underline"
                >
                    storybridgeteens@gmail.com
                </a>
            </div>
        </footer>
    );
};

export default Footer;
