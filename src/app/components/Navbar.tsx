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
  {
    label: "Resources",
    children: [{ href: "/blog", label: "Blog" }],
  },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  return (
    <nav className="relative flex items-center justify-between w-full shadow-lg navbar">
      {/* Logo */}
      <div className="relative flex items-center justify-start w-full h-12 md:w-48 md:h-20">
        <Link
          href="/"
          className="relative flex items-center justify-start w-full h-12 md:w-48 md:h-20"
        >
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
  <ul className="flex gap-10 xl:gap-12 text-white text-base xl:text-lg font-bold tracking-wide truncate overflow-visible">
    {links.map((link, i) => (
<li
  key={i}
  className="relative group"
  onMouseEnter={() => {
    const dropdown = document.getElementById(`dropdown-${i}`);
    console.log(`Hovering on menu ${i}:`, dropdown);

    if (dropdown) {
      const rect = dropdown.getBoundingClientRect();
      console.log("Dropdown bounding rect:", rect);

      // Parent info
      let parent = dropdown.parentElement;
      while (parent) {
        const styles = getComputedStyle(parent);
        console.log(
          "Parent element:",
          parent.tagName,
          "overflow:",
          styles.overflow,
          "position:",
          styles.position,
          "z-index:",
          styles.zIndex
        );
        parent = parent.parentElement;
      }
    }
  }}
>
  {link.children ? (
    <>
      <button className="flex items-center gap-1 navbar-link">
        {link.label.toUpperCase()}
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" />
        </svg>
      </button>

      <ul
        id={`dropdown-${i}`}
        className="absolute left-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
      >
        {link.children.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className="block px-4 py-2 hover:bg-gray-200"
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <Link href={link.href} className="navbar-link">
      {link.label.toUpperCase()}
    </Link>
  )}
</li>


    ))}
  </ul>
</div>

      {/* Right controls */}
      <div className="flex items-center gap-4 mr-4">
        {/* Hamburger */}
        <div className="lg:hidden h-full flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
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

        {/* Profile / Log In dropdown */}
        <div className="relative group hidden lg:flex items-center">
          <Image
            src="/assets/icons/Profile.svg"
            alt="Profile"
            width={48}
            height={48}
            className="w-12 h-12 object-contain flex-shrink-0 cursor-pointer"
          />
          <ul className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
            <li>
              <Link href="/login" className="block px-4 py-2 hover:bg-gray-200">
                Log In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="block px-4 py-2 hover:bg-gray-200">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full flex flex-col items-center text-white font-bold space-y-4 py-6 lg:hidden navbar-mobile-menu bg-black">
          <ul className="flex flex-col items-center space-y-4">
            {links.map((link, i) => (
              <li key={i} className="text-center">
                {link.children ? (
                  <details>
                    <summary className="cursor-pointer flex items-center gap-1 justify-center">
                      {link.label.toUpperCase()}
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                      </svg>
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block hover:underline"
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
                    className="hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                )}
              </li>
            ))}
            {/* Mobile Log In / Sign Up */}
            <li>
              <Link
                href="/login"
                className="hover:underline"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="hover:underline"
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
