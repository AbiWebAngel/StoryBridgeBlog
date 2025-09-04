"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        <nav className="relative flex items-center bg-light shadow-lg w-full">
            {/* Logo */}
            <div className="bg-brand-dark flex items-center justify-center w-20 h-16 md:w-60 md:h-30">
                <Image
                    src="/logo.png"
                    alt="Story Bridge Logo"
                    width={220}
                    height={180}
                    className="object-contain w-full h-full"
                    priority
                />
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex flex-1 items-center justify-between ml-6">
                <ul className="flex gap-12 text-white font-serif text-lg font-bold tracking-wide">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className="hover:underline">
                                {link.label.toUpperCase()}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right side controls (always visible) */}
            <div className="flex items-center ml-auto mr-4 gap-4">
                {/* Mobile hamburger */}
                <div className="md:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24">
                            <path
                                d="M4 6h16M4 12h16M4 18h16"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Profile icon (always visible) */}
                <Link href="/profile">
                    <Image
                        src="/profile.svg"
                        alt="Profile"
                        width={40}
                        height={40}
                        className="object-contain w-10 h-10"
                    />
                </Link>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="absolute top-16 left-0 w-full bg-brand-dark flex flex-col items-center text-white font-serif text-lg font-bold tracking-wide space-y-4 py-6 md:hidden z-50">
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
