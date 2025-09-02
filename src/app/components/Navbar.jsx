import Link from "next/link";
import Image from "next/image";

const row1 = [
    { href: "/beta-reading", label: "Beta reading" },
    { href: "/about", label: "About" },
    { href: "/team", label: "Team" },
];

const row2 = [
    { href: "/mentorship", label: "Mentorship" },
    { href: "/blog", label: "Blog" },
    { href: "/workshops", label: "Workshops" },
];

const Navbar = () => (
    <nav className="flex bg-light shadow-lg">
        {/* Logo section */}
        <div className="bg-brand-dark flex items-center justify-center min-w-[220px] min-h-[120px]">
            <Image
                src="/logo.png"
                alt="Story Bridge Logo"
                width={270}
                height={220}
                className="object-contain"
                priority
            />
        </div>

        {/* Menu + profile */}
        <div className="bg-brand-light flex-1 flex items-center justify-between px-10 py-3">
            {/* Menu (centered 2 rows) */}
            <ul className="flex flex-col items-center justify-center text-white font-serif text-lg font-bold tracking-wide space-y-3">
                <li className="flex space-x-60">
                    {row1.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:underline">
                            {link.label.toUpperCase()}
                        </Link>
                    ))}
                </li>
                <li className="flex space-x-60">
                    {row2.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:underline">
                            {link.label.toUpperCase()}
                        </Link>
                    ))}
                </li>
            </ul>

            {/* Profile icon */}
            <Image
                src="/profile.svg"
                alt="Profile"
                width={60}
                height={48}
                className="object-contain ml-8"
            />
        </div>
    </nav>
);

export default Navbar;
