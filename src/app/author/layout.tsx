"use client";

import { useAuth } from "@/context/AuthContext";
import SideNav from "@/components/nav/SideNav";
import MobileNav from "@/components/nav/MobileNav";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();

  return (
     <div className="flex flex-col lg:flex-row min-h-screen">
    <SideNav role={role ?? "author"} />

    <div className="flex-1 flex flex-col">
        <MobileNav role={role ?? "author"} />
        <main className="p-4 lg:p-6">{children}</main>
    </div>
    </div>

  );
}
