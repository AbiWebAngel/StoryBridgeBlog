import Link from "next/link";
import React from "react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
});

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/beta-reading", label: "Beta Reading" },
  { href: "/workshops", label: "Workshops" },
  { href: "/blog", label: "Blog" },
  { href: "/submit", label: "Submit" },
];

const Navbar: React.FC = () => {
  return (
    <nav 
    className={`${cinzel.className}`}
    style={{ marginBottom: "20px", fontSize: "25px", fontWeight:"700"}}>
      {links.map((link, index) => (
        <React.Fragment key={link.href}>
          <Link href={link.href} style={{ margin:"0 10px" }}>
          {link.label}
          </Link>
          {index < links.length - 1 && " | "}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Navbar;
