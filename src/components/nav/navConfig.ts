import {
  FiHeart,
  FiUser,
  FiMail,
  FiLock,
  FiFileText,
  FiBook,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import { IconType } from "react-icons";

export type UserRole = "reader" | "author" | "admin";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ----- BASE SECTIONS -----

const readerItems: NavItem[] = [
  { label: "Dashboard Home", href: "/dashboard", icon: FiUser },
  { label: "My Profile", href: "/dashboard/profile", icon: FiUser },
  { label: "My Favourites", href: "/dashboard/favourites", icon: FiHeart },
  { label: "Change Email", href: "/dashboard/email", icon: FiMail },
];

const authorItems: NavItem[] = [
  { label: "My Articles", href: "/author/articles", icon: FiFileText },
  { label: "Write New Article", href: "/author/articles/new", icon: FiBook },
  { label: "Analytics", href: "/author/analytics", icon: FiUsers },
];

const adminItems: NavItem[] = [
  { label: "All Articles", href: "/admin/articles", icon: FiFileText },
  { label: "User Management", href: "/admin/users", icon: FiUsers },
  { label: "Site Content", href: "/admin/site-content", icon: FiSettings },
  { label: "Analytics Dashboard", href: "/admin/analytics", icon: FiUsers },
];

export const navItems: Record<UserRole, NavSection[]> = {
  reader: [
    {
      title: "My Account",
      items: readerItems,
    },
  ],

  author: [
    {
      title: "My Account",
      items: readerItems,
    },
    {
      title: "Author Tools",
      items: authorItems,
    },
  ],

  admin: [
    {
      title: "My Account",
      items: readerItems,
    },
    {
      title: "Author Tools",
      items: authorItems,
    },
    {
      title: "Admin Tools",
      items: adminItems,
    },
  ],
};
