// src/components/SiteHeader.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const marketingLinks = [
  { href: "/features", label: "Fonctionnalités" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/docs", label: "Docs" },
  { href: "/support", label: "Support" },
];

const authenticatedLinks = [
  { href: "/admin/qcm/new", label: "New QCM" },
  { href: "/admin/qcm", label: "My QCMs" },
  { href: "/admin/results", label: "Results" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/settings", label: "Settings" },
];

function isActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Masquer l’en-tête pour les pages candidats
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  const onLogout = async () => {
    try {
      await logout(); // efface la session côté API
      router.push("/login"); // redirige proprement
    } catch {
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-semibold tracking-tight hover:opacity-80">
            ISMNS
          </Link>
          <div className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "transition hover:text-blue-600" +
                  (isActive(pathname, link.href) ? " text-blue-600 font-medium" : "")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {loading ? (
          // Placeholders stables pour éviter le “trou” pendant /auth/me
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-5 text-sm">
            {authenticatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "transition hover:text-blue-600" +
                  (isActive(pathname, link.href) ? " text-blue-600 font-medium" : "")
                }
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={onLogout}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-gray-400"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="hover:text-blue-600">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
