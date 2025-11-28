"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar"; // adjust the path if needed


const links = [
  {
    label: "About",
    children: [
      { href: "/about", label: "About Us" },
      { href: "/team", label: "Team" },
    ],
  },
  {
    label: "Beta Reading",
    children: [
      { href: "/beta-reading", label: "Register" },
      { href: "/mentorship", label: "Mentorship" },
    ],
  },
  { href: "/workshops", label: "Workshops" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Blog" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const totalItems = links.length + 2;
  const { user, logout } = useAuth();


  const handleLoginClick = () => {
    setLoginModalOpen(true);
    setMenuOpen(false);
  };

  const handleRegisterClick = () => {
    setRegisterModalOpen(true);
    setMenuOpen(false);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const switchToRegister = () => {
    closeLoginModal();
    setTimeout(() => {
      setRegisterModalOpen(true);
    }, 300);
  };

  const switchToLogin = () => {
    closeRegisterModal();
    setTimeout(() => {
      setLoginModalOpen(true);
    }, 300);
  };

  return (
    <>
      <nav className="relative flex items-center justify-between w-full shadow-lg navbar h-14 md:h-16 lg:h-28">
        {/* Logo */}
        <div className="relative flex items-center justify-start w-full h-full md:w-60">
          <Link href="/" className="relative flex items-center justify-start w-full h-full">
            <Image
              src="/logo.jpg"
              alt="Story Bridge Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:flex flex-1 items-center justify-center min-w-0 overflow-visible pt-2">
          <ul className="flex gap-6 xl:gap-8 text-white text-sm xl:text-base font-bold tracking-wide truncate overflow-visible">
            {links.map((link, i) => (
              <li
                key={i}
                className="relative group before:absolute before:content-[''] before:top-full before:left-0 before:w-full before:h-6"
              >
                {link.children ? (
                  <>
                    {/* Increased clickable area with padding */}
                    <button className="flex items-center gap-1 navbar-link py-3 px-4 -mx-2 relative">
                      {link.label.toUpperCase()}
                      <svg
                        className="w-4 h-4 text-white transition-transform duration-200 group-hover:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                      </svg>
                    </button>

                    {/* Dropdown menu positioned to account for larger click area */}
                    <ul
                      className="absolute left-1/2 -translate-x-1/2 mt-9 w-48 bg-[#805C2C] text-white rounded-lg shadow-lg py-2
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-auto"
                    >
                      {link.children.map((child, index) => (
                        <li key={child.href} className={index === 0 ? "" : "border-t border-white"}>
                          <Link
                            href={child.href}
                            className="block px-4 py-3 hover:bg-[#A07845] navbar-link"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="navbar-link relative group py-3 px-4 -mx-2 block"
                  >
                    <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                      {link.label.toUpperCase()}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 mr-4">
          {/* Hamburger */}
          <div className="lg:hidden h-full flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

        {/* Profile */}
        <div className="hidden lg:flex items-center">
          <ul className="flex gap-3">
            <li className="relative group">
              {/* Clickable area wrapper */}
              <div className="relative cursor-pointer p-8 -m-2 flex items-center justify-center">
                <Avatar
                  name={user?.name}
                  initials={user?.initials}
                  size={45} // matches your w-10 h-10
                />
              </div>

             {/* Dropdown */}
              <ul className="absolute right-0 mt-5 w-52 bg-[#805C2C] text-white rounded-lg shadow-lg py-1
               opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50
               text-sm font-semibold tracking-wide pointer-events-auto">

              {user ? (
                <>
                  {/* Greeting */}
                  <li className="px-4 py-2 border-b border-white/20 select-none cursor-default">
                    <span>Hello, {user.name?.split(" ")[0] || "User"}</span>
                  </li>


                  {/* Logout */}
                  <li
                    className="px-4 py-2 hover:bg-[#A07845] cursor-pointer transition-colors"
                    onClick={logout}
                  >
                    Log Out
                  </li>
                </>
              ) : (
                <li className="px-2 py-1 flex gap-1">
                  <button
                    onClick={handleLoginClick}
                    className="flex-1 py-2 text-center rounded-l hover:bg-[#A07845] transition-colors"
                  >
                    Log In
                  </button>
                  <span className="text-white/70 flex items-center px-1 select-none">/</span>
                  <button
                    onClick={handleRegisterClick}
                    className="flex-1 py-2 text-center rounded-r hover:bg-[#A07845] transition-colors"
                  >
                    Sign Up
                  </button>
                </li>
              )}
            </ul>


            </li>
          </ul>
        </div>

        </div>

        {/* Mobile menu with consistent timing */}
        <div className={`
          absolute top-14 left-0 w-full flex flex-col items-center text-white font-bold lg:hidden 
          navbar-mobile-menu overflow-hidden z-[9999] transition-all duration-300 ease-in-out
          ${menuOpen 
            ? "max-h-screen opacity-100 visible py-4" 
            : "max-h-0 opacity-0 invisible delay-[400ms]"
          }
        `}>
          <ul className="flex flex-col items-center w-full space-y-2">
            {links.map((link, i) => (
              <li 
                key={i} 
                className="text-center w-full transition-all duration-300 ease-out"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
                  transitionDelay: menuOpen ? `${100 + i * 60}ms` : `${(totalItems - 1 - i) * 60}ms`,
                }}
              >
                {link.children ? (
                  <details className="relative w-full group">
                    {/* Mobile dropdown trigger - compact spacing */}
                    <summary className="cursor-pointer flex items-center gap-1 justify-center py-4 px-4 w-full hover:bg-[#A07845]">
                      {link.label.toUpperCase()}
                      <svg
                        className="w-4 h-4 text-white transition-transform duration-200 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                      </svg>
                    </summary>
                    {/* Dropdown children with compact spacing */}
                    <ul className="mt-1 space-y-1 w-full bg-[#6a4a24]">
                      {link.children.map((child, childIndex) => (
                        <li 
                          key={child.href} 
                          className="w-full transition-all duration-300 ease-out"
                          style={{
                            opacity: menuOpen ? 1 : 0,
                            transform: menuOpen ? 'translateX(0)' : 'translateX(-8px)',
                            transitionDelay: menuOpen 
                              ? `${150 + i * 60 + childIndex * 50}ms` 
                              : `${(link.children.length - 1 - childIndex) * 50 + i * 60}ms`,
                          }}
                        >
                          <Link
                            href={child.href}
                            className="block px-4 py-3 hover:bg-[#A07845] w-full text-center"
                            onClick={() => setMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-4 py-4 hover:bg-[#A07845] w-full text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                )}
              </li>
            ))}
            <li 
              className="w-full transition-all duration-300 ease-out"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
                transitionDelay: menuOpen 
                  ? `${100 + links.length * 60}ms` 
                  : `${(totalItems - 1 - links.length) * 60}ms`,
              }}
            >
              <button
                onClick={handleLoginClick}
                className="block px-4 py-4 hover:bg-[#A07845] w-full text-center"
              >
                Log In
              </button>
            </li>
            <li 
              className="w-full transition-all duration-300 ease-out"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
                transitionDelay: menuOpen 
                  ? `${100 + (links.length + 1) * 60}ms` 
                  : `${(totalItems - 1 - (links.length + 1)) * 60}ms`,
              }}
            >
              <button
                onClick={handleRegisterClick}
                className="block px-4 py-4 hover:bg-[#A07845] w-full text-center"
              >
                Sign Up
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={switchToRegister}
      />
      
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={closeRegisterModal}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Navbar;