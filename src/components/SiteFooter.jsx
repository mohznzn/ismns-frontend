// src/components/SiteFooter.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/changelog", label: "Changelog" },
  { href: "/terms", label: "CGU" },
  { href: "/privacy", label: "Confidentialité" },
];

export default function SiteFooter() {
  const pathname = usePathname();

  // Masquer pour le parcours candidat
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">ISMNS</span>
          <span className="text-gray-500">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gray-900">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
