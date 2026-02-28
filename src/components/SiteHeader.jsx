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
  const [openaiUsage, setOpenaiUsage] = useState({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 });
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isProtectedRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/super-admin");

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!user) {
      setOpenaiUsage({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 });
      setUsageError(false);
      return;
    }

    const loadUsage = async () => {
      try {
        setUsageLoading(true);
        setUsageError(false);
        const data = await auth.getOpenAIUsage();
        if (data && typeof data === 'object') {
          const total = Math.max(0, Math.floor(Number(data.total_tokens) || 0));
          const prompt = Math.max(0, Math.floor(Number(data.prompt_tokens) || 0));
          const completion = Math.max(0, Math.floor(Number(data.completion_tokens) || 0));
          if (isNaN(total) || !isFinite(total)) {
            setOpenaiUsage({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 });
          } else {
            setOpenaiUsage({ total_tokens: total, prompt_tokens: prompt, completion_tokens: completion });
          }
        } else {
          setOpenaiUsage({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 });
        }
      } catch {
        setUsageError(true);
      } finally {
        setUsageLoading(false);
      }
    };

    loadUsage();
    const interval = setInterval(loadUsage, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (
    pathname?.startsWith("/invite") ||
    pathname?.startsWith("/test") ||
    pathname?.startsWith("/intake") ||
    pathname?.startsWith("/verify-email")
  ) return null;

  // Super admin section has its own nav — hide this header entirely
  if (pathname?.startsWith("/super-admin")) return null;

  const onLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.refresh();
    }
  };

  const isActive = (href) => pathname === href || pathname?.startsWith(href);

  const formatTokens = (tokens) => {
    if (tokens === null || tokens === undefined || isNaN(tokens) || !isFinite(tokens)) return "0";
    const n = Number(tokens);
    if (isNaN(n) || !isFinite(n) || n < 0) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return Math.floor(n).toString();
  };

  const marketing = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  const showSkeleton = loading || (isProtectedRoute && !user);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* Brand */}
        <Link href={user ? "/admin/qcm" : "/"} className="font-semibold tracking-tight hover:opacity-80">
          ISMNS
        </Link>

        {showSkeleton ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : user ? (
          <>
            {/* Desktop authenticated nav */}
            <div className="hidden md:flex items-center gap-5 text-sm">
              {/* OpenAI Usage */}
              {usageLoading ? (
                <div className="h-6 w-24 rounded bg-gray-100 animate-pulse" />
              ) : (
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                  usageError ? "bg-gray-50 border-gray-300 text-gray-600" : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {usageError ? "OpenAI: Error" : `OpenAI: ${formatTokens(openaiUsage?.total_tokens ?? 0)} tokens`}
                </div>
              )}
              {user.role === "super_admin" && (
                <Link href="/super-admin" className={`hover:text-blue-600 ${isActive("/super-admin") ? "font-semibold" : ""}`}>
                  Super Admin
                </Link>
              )}
              <Link href="/admin/qcm/new" className={`hover:text-blue-600 ${isActive("/admin/qcm/new") ? "font-semibold" : ""}`}>
                New Assessment
              </Link>
              <Link href="/admin/qcm" className={`hover:text-blue-600 ${isActive("/admin/qcm") && !isActive("/admin/qcm/new") ? "font-semibold" : ""}`}>
                My Assessments
              </Link>
              <button onClick={onLogout} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50">
                Logout
              </button>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </>
        ) : (
          <>
            {/* Desktop public nav */}
            <div className="hidden md:flex items-center gap-5 text-sm">
              {marketing.map((m) => (
                <Link key={m.href} href={m.href}
                  aria-current={isActive(m.href) ? "page" : undefined}
                  className={`hover:text-blue-600 ${isActive(m.href) ? "font-semibold" : "opacity-90"}`}>
                  {m.label}
                </Link>
              ))}
              <Link href="/login" className={`hover:text-blue-600 ${isActive("/login") ? "font-semibold" : ""}`}>Login</Link>
              <Link href="/register" className={`hover:text-blue-600 ${isActive("/register") ? "font-semibold" : ""}`}>Register</Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </>
        )}
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && !showSkeleton && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                  usageError ? "bg-gray-50 border-gray-300 text-gray-600" : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {usageError ? "OpenAI: Error" : `OpenAI: ${formatTokens(openaiUsage?.total_tokens ?? 0)} tokens`}
                </div>
                {user.role === "super_admin" && (
                  <Link href="/super-admin" className="block py-2 text-sm text-gray-700 hover:text-blue-600">Super Admin</Link>
                )}
                <Link href="/admin/qcm/new" className="block py-2 text-sm text-gray-700 hover:text-blue-600">New Assessment</Link>
                <Link href="/admin/qcm" className="block py-2 text-sm text-gray-700 hover:text-blue-600">My Assessments</Link>
                <button onClick={onLogout} className="w-full text-left py-2 text-sm text-red-600 hover:text-red-800">Logout</button>
              </>
            ) : (
              <>
                {marketing.map((m) => (
                  <Link key={m.href} href={m.href} className="block py-2 text-sm text-gray-700 hover:text-blue-600">{m.label}</Link>
                ))}
                <div className="flex gap-3 pt-2 border-t">
                  <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">Login</Link>
                  <Link href="/register" className="text-sm text-blue-600 hover:text-blue-800">Register</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
