// src/components/SiteFooter.jsx
"use client";

import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/invite") || pathname.startsWith("/test")) return null;

  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
      © {new Date().getFullYear()} ISMNS
    </footer>
  );
}
