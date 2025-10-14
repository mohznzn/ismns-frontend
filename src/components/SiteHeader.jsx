// src/components/SiteHeader.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const marketingLinks = [
  { href: "/features", label: "Fonctionnalités" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/docs", label: "Documentation" },
  { href: "/support", label: "Support" },
];

const authenticatedLinks = [
  { href: "/admin/qcm/new", label: "Créer un QCM" },
  { href: "/admin/qcm", label: "QCM" },
  { href: "/admin/results", label: "Résultats" },
  { href: "/admin/billing", label: "Facturation" },
  { href: "/admin/settings", label: "Paramètres" },
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

  const isCandidateSurface = pathname?.startsWith("/invite") || pathname?.startsWith("/test");
  if (isCandidateSurface) return null;

  const onLogout = async () => {
    try {
      await logout(); // efface la session côté API
      router.push("/login"); // redirige proprement
    } catch {
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white via-white/95 to-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-lg shadow-gray-200/60">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-base font-semibold tracking-tight text-gray-900 hover:text-gray-700">
              ISMNS
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-gray-600 md:flex">
              {marketingLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "rounded-full px-3 py-1 transition-colors" +
                    (isActive(pathname, link.href)
                      ? " bg-gray-900 text-white shadow"
                      : " hover:bg-gray-100 hover:text-gray-900")
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
              <div className="h-9 w-28 animate-pulse rounded-full bg-gray-100" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "rounded-full px-3 py-1 transition-colors" +
                    (isActive(pathname, link.href)
                      ? " bg-gray-900 text-white shadow"
                      : " hover:bg-gray-100 hover:text-gray-900")
                  }
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={onLogout}
                className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link
                href="/login"
                className={
                  "rounded-full px-4 py-1.5 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900" +
                  (isActive(pathname, "/login") ? " bg-gray-900 text-white" : "")
                }
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gray-900 px-4 py-1.5 text-white shadow transition hover:bg-gray-700"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
