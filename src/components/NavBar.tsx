"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/content", label: "Content" },
  { href: "/intel", label: "Intel" },
  { href: "/hmrc", label: "HMRC" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-5 shrink-0">
      <div className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
                isActive
                  ? "text-slate-100 border-violet-500"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
