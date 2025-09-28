"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <nav className="relative flex items-center justify-between w-full shadow-lg navbar bg-black h-14 md:h-16">
      {/* Logo */}
      <div className="relative flex items-center justify-start w-full h-full md:w-48">
        <Link href="/" className="relative flex items-center justify-start w-full h-full">
          <Image
            src="/logo.png"
            alt="Story Bridge Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>
      </div>

      {/* Desktop menu */}
      <div className="hidden lg:flex flex-1 items-center justify-center min-w-0 overflow-visible">
        <ul className="flex gap-6 xl:gap-8 text-white text-sm xl:text-base font-bold tracking-wide truncate overflow-visible">
          {links.map((link, i) => (
            <li
              key={i}
              className="relative group before:absolute before:content-[''] before:top-full before:left-0 before:w-full before:h-6"
            >
              {link.children ? (
                <>
                  <button className="flex items-center gap-1 navbar-link">
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

                  <ul
                    className="absolute left-1/2 -translate-x-1/2 mt-6 w-40 bg-[#805C2C] text-white rounded-lg shadow-lg py-2
                               opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-auto"
                  >
                    {link.children.map((child, index) => (
                      <li key={child.href} className={index === 0 ? "" : "border-t border-white"}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 hover:bg-[#A07845] navbar-link"
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
                  className="navbar-link relative group pb-1"
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
          <div className="relative cursor-pointer p-2 -m-2 flex items-center justify-center">
            <Image
              src="/assets/icons/Profile.svg"
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </div>

          {/* Dropdown */}
          <ul
            className="absolute right-0 mt-4 w-44 bg-[#805C2C] text-white rounded-lg shadow-lg py-2
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50
                      text-base font-bold tracking-wide pointer-events-auto"
          >
            <li>
              <Link
                href="/login"
                className="block px-4 py-2 hover:bg-[#A07845]"
              >
                Log In / Sign Up
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </div>




      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 w-full flex flex-col items-center text-white font-bold space-y-3 py-4 lg:hidden navbar-mobile-menu bg-black overflow-visible z-[9999]">
          <ul className="flex flex-col items-center space-y-3 w-full">
            {links.map((link, i) => (
              <li key={i} className="text-center w-full">
                {link.children ? (
                  <details className="relative w-full group">
                    <summary className="cursor-pointer flex items-center gap-1 justify-center">
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
                    <ul className="mt-1 space-y-1 w-full">
                      {link.children.map((child) => (
                        <li key={child.href} className="w-full">
                          <Link
                            href={child.href}
                            className="block px-4 py-2 hover:bg-[#A07845] w-full text-center"
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
                    className="block px-4 py-2 hover:bg-[#A07845] w-full text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                )}
              </li>
            ))}
            <li className="w-full">
              <Link
                href="/login"
                className="block px-4 py-2 hover:bg-[#A07845] w-full text-center"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
            </li>
            <li className="w-full">
              <Link
                href="/signup"
                className="block px-4 py-2 hover:bg-[#A07845] w-full text-center"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
