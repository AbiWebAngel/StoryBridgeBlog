"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, UserRole } from "./navConfig";


export default function SideNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const sections = navItems[role] || [];

  return (
    <aside className="w-64 bg-[#EDE4D6] border-r border-[#D8CDBE] p-6 hidden lg:block font-sans">
      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="!font-sans text-xs uppercase tracking-wider text-[#6B5A40] mb-2 font-semibold">
              {section.title}
            </h3>


            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-md transition text-[#4A3820]
                    ${active ? "bg-[#D8CDBE] font-semibold" : "hover:bg-[#E6DCCB]"}`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


