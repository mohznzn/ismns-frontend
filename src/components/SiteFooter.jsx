// src/components/SiteFooter.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  // Masquer le footer pour le parcours candidat
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  // Footer minimal dans l'app authentifiée (admin / dashboard)
  const isApp =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard");

  if (isApp) {
    return (
      <footer className="border-t text-xs text-gray-500">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center gap-4">
          <span>© {new Date().getFullYear()} ISMNS</span>
          <nav className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-800">CGU</Link>
            <Link href="/privacy" className="hover:text-gray-800">Confidentialité</Link>
          </nav>
        </div>
      </footer>
    );
  }

  // Footer marketing (pages publiques)
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600 grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="font-semibold text-gray-900">ISMNS</div>
          <p className="max-w-md">
            Agent IA de recrutement — QCM multi-langues, rapports clairs, lien unique candidat.
          </p>
          <p className="text-gray-500">© {new Date().getFullYear()} ISMNS</p>
        </div>

        <div className="md:justify-self-end">
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/features" className="hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/how-it-works" className="hover:text-gray-900">How it works</Link>
            <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
            <Link href="/changelog" className="hover:text-gray-900">Changelog</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
