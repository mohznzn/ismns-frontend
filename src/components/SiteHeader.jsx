// src/components/SiteHeader.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { auth } from "@/lib/api";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [openaiUsage, setOpenaiUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Charger la consommation OpenAI
  useEffect(() => {
    if (!user) {
      setOpenaiUsage(null);
      return;
    }

    const loadUsage = async () => {
      try {
        setUsageLoading(true);
        const data = await auth.getOpenAIUsage();
        setOpenaiUsage(data);
      } catch (err) {
        console.error("Error loading OpenAI usage:", err);
      } finally {
        setUsageLoading(false);
      }
    };

    loadUsage();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(loadUsage, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Hide header for candidate flow
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  const onLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.refresh();
    }
  };

  const isActive = (href) => pathname === href || pathname?.startsWith(href);

  // Formater les tokens pour l'affichage
  const formatTokens = (tokens) => {
    if (!tokens) return "0";
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  // Public marketing links
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
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80">
          ISMNS
        </Link>

        {/* Right side */}
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : user ? (
          // Authenticated (recruiting)
          <div className="flex items-center gap-6 text-sm">
            {/* OpenAI Usage Display */}
            {openaiUsage && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-700 font-medium">
                  OpenAI: {formatTokens(openaiUsage.total_tokens)} tokens
                </span>
              </div>
            )}
            {usageLoading && (
              <div className="h-6 w-24 rounded bg-gray-100 animate-pulse" />
            )}
            <Link
              href="/admin/qcm/new"
              className={`hover:text-blue-600 ${isActive("/admin/qcm/new") ? "font-semibold" : ""}`}
            >
              New Assessment
            </Link>
            <Link
              href="/admin/qcm"
              className={`hover:text-blue-600 ${isActive("/admin/qcm") ? "font-semibold" : ""}`}
            >
              My Assessments
            </Link>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : (
          // Public (marketing) + auth
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
