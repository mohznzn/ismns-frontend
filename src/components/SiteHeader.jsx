// src/components/SiteHeader.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Masque header pour les candidats
  if (pathname.startsWith("/invite") || pathname.startsWith("/test")) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        <Link href="/" className="font-semibold hover:opacity-80">ISMNS</Link>

        <div className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link href="/admin/qcm/new" className="hover:text-blue-600">New QCM</Link>
              <Link href="/admin/myqcms" className="hover:text-blue-600">My QCMs</Link>
              <Link href="/admin/results" className="hover:text-blue-600">Results</Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link href="/register" className="hover:text-blue-600">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
