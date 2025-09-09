"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const links = [
    { href: "/beta-reading", label: "Beta reading" },
    { href: "/team", label: "Team" },
    { href: "/mentorship", label: "Mentorship" },
    { href: "/blog", label: "Blog" },
    { href: "/workshops", label: "Workshops" },
];


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between bg-light shadow-lg w-full pr-4">
    {/* Logo */}
     <div className="bg-brand-dark relative flex items-center justify-center w-16 h-12 md:w-48 md:h-20">
        <Image
            src="/logo.png"
            alt="Story Bridge Logo"
            fill
            className="object-contain"
            priority
        />
    </div>



 
     {/* Desktop menu */}
    <div className="hidden lg:flex flex-1 items-center justify-center min-w-0">
    <ul className="flex gap-10 xl:gap-12 text-white font-cinzel text-base xl:text-lg font-bold tracking-wide truncate">
        {links.map((link) => (
        <li key={link.href}>
            <Link href={link.href} className="hover:underline">
            {link.label.toUpperCase()}
            </Link>
        </li>
        ))}
    </ul>
    </div>


      {/* Right side controls */}
      <div className="flex items-center gap-4 ml-4">
      {/* Mobile hamburger / close button */}
        <div className="lg:hidden">
        <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
        >
            {menuOpen ? (
            // X icon
            <svg width="32" height="32" viewBox="0 0 24 24">
                <path
                d="M6 6l12 12M6 18L18 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                />
            </svg>
            ) : (
            // Hamburger icon
            <svg width="32" height="32" viewBox="0 0 24 24">
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


        {/* Profile icon */}
        <Link href="/profile">
          <Image
            src="/profile.svg"
            alt="Profile"
            width={40}
            height={40}
            className="w-10 h-10 object-contain flex-shrink-0"
          />
        </Link>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
       <div className="absolute top-16 left-0 w-full bg-brand-dark flex flex-col items-center text-white font-cinzel text-lg font-bold tracking-wide space-y-4 py-6 lg:hidden z-50">
          <ul className="flex flex-col items-center space-y-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
