"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${BACKEND}/auth/me`, { credentials: "include" });
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        if (!data.user || data.user.role !== "super_admin") { router.push("/admin/qcm"); return; }
        setUser(data.user);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    checkAuth();
  }, [router]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>;
  if (!user) return null;

  const navItems = [
    { href: "/super-admin", label: "Dashboard", icon: "📊" },
    { href: "/super-admin/recruiters", label: "Recruiters", icon: "👥" },
    { href: "/super-admin/qcms", label: "Assessments", icon: "📝" },
    { href: "/super-admin/candidates", label: "Candidates", icon: "🎯" },
    { href: "/super-admin/activity", label: "Activity", icon: "🕐" },
    { href: "/super-admin/config", label: "Config", icon: "⚙️" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop: two rows - title+email on top, tabs below */}
          <div className="hidden sm:flex items-center justify-between h-12">
            <span className="text-lg font-bold text-blue-600">Super Admin</span>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{user.email}</span>
              <Link href="/admin/qcm" className="hover:text-gray-900">Back to Admin</Link>
            </div>
          </div>
          <div className="hidden sm:flex space-x-1 overflow-x-auto pb-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/super-admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center whitespace-nowrap px-3 py-2 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center justify-between h-14">
            <span className="text-lg font-bold text-blue-600">Super Admin</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/super-admin" && pathname?.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={`block pl-3 pr-4 py-2 text-base font-medium ${
                      isActive ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700" : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50"
                    }`}>
                    <span className="mr-2">{item.icon}</span>{item.label}
                  </Link>
                );
              })}
            </div>
            <div className="py-2 border-t border-gray-200 px-4">
              <p className="text-sm text-gray-600 mb-1">{user.email}</p>
              <Link href="/admin/qcm" className="text-sm text-blue-600 hover:text-blue-800">Back to Admin</Link>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto">{children}</div>
    </>
  );
}
