"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, UserRole } from "./navConfig";
import { FiMenu, FiX } from "react-icons/fi";

export default function MobileNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sections = navItems[role] || [];

  return (
    <>
      {/* Floating drawer trigger */}
      <button
        onClick={() => setOpen(true)}
        className="
          lg:hidden
          fixed top-20 left-4
          z-40
          bg-[#4A3820] text-white
          p-3 rounded-full shadow-md
        "
        aria-label="Open dashboard navigation"
      >
        <FiMenu size={20} />
      </button>

      {/* Drawer */}
     {open && (
      <div
        className="fixed inset-0 bg-black/40 z-50 lg:hidden font-sans!"
        onClick={() => setOpen(false)}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className="w-64 h-full bg-[#EDE4D6] p-6 font-sans! shadow-xl overflow-y-auto overscroll-contain scrollable-description"
        >
            <button className="mb-4 font-sans" onClick={() => setOpen(false)}>
              <FiX size={22} />
            </button>

            {sections.map((section) => (
              <div key={section.title} className="mb-6 font-sans">
                <h3 className="text-xs uppercase text-[#6B5A40] mb-2 font-sans!">
                  {section.title}
                </h3>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-md font-sans!
                      ${active ? "bg-[#D8CDBE]" : ""}`}
                    >
                      <Icon size={18} />
                      <span className="font-sans!">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </aside>
        </div>
      )}
    </>
  );
}