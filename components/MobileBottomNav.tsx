"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Link2, Video } from "lucide-react";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Create",
    href: "/dashboard/new",
    icon: PlusCircle,
  },
  {
    label: "Links",
    href: "/dashboard#assessment-links",
    icon: Link2,
  },
  {
    label: "Reviews",
    href: "/dashboard#recent-submissions",
    icon: Video,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href.split("#")[0]) &&
                item.href !== "/dashboard";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-black transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
