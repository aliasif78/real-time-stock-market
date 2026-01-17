"use client";

// Next Js
import Link from "next/link";
import { usePathname } from "next/navigation";

// Data
import { NAV_ITEMS } from "@/lib/constants";

const NavItems = () => {
  // Hooks
  const pathname = usePathname();

  // Functions
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <ul className="flex flex-col sm:flex-row gap-3 p-2 sm:gap-10 font-medium">
      {NAV_ITEMS.map((item, index) => (
        <li key={index}>
          <Link href={item.href} className={`hover:text-yellow-500 transition-colors ${isActive(item.href) ? "text-gray-100" : ""}`}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;
