// src/components/SiteHeader.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Masquer l’en-tête pour les pages candidats
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  const onLogout = async () => {
    try {
      await logout();           // efface la session côté API
      router.push("/login");    // redirige proprement
    } catch {
      router.refresh();
    }
  };

  const isActive = (href) => (pathname === href || pathname?.startsWith(href));

  // Liens marketing (restent accessibles même sans être connecté)
  const marketing = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80">
          ISMNS
        </Link>

        {/* Zone actions à droite */}
        {loading ? (
          // Placeholders stables pour éviter le “trou” pendant /auth/me
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : user ? (
          // Navigation une fois connecté
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/admin/qcm/new"
              className={`hover:text-blue-600 ${isActive("/admin/qcm/new") ? "font-semibold" : ""}`}
            >
              New QCM
            </Link>
            <Link
              href="/admin/qcm"
              className={`hover:text-blue-600 ${isActive("/admin/qcm") ? "font-semibold" : ""}`}
            >
              My QCMs
            </Link>
            <Link
              href="/admin/results"
              className={`hover:text-blue-600 ${isActive("/admin/results") ? "font-semibold" : ""}`}
            >
              Results
            </Link>
            {/* Lien rapide vers le dashboard si tu as une page dédiée */}
            <Link
              href="/dashboard"
              className={`hover:text-blue-600 ${isActive("/dashboard") ? "font-semibold" : ""}`}
            >
              Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : (
          // Navigation publique (marketing) + Auth
          <div className="flex items-center gap-6 text-sm">
            {marketing.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                aria-current={isActive(m.href) ? "page" : undefined}
                className={`hover:text-blue-600 ${isActive(m.href) ? "font-semibold" : "opacity-90"}`}
              >
                {m.label}
              </Link>
            ))}
            <Link
              href="/login"
              className={`hover:text-blue-600 ${isActive("/login") ? "font-semibold" : ""}`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`hover:text-blue-600 ${isActive("/register") ? "font-semibold" : ""}`}
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
