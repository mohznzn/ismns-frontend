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

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${BACKEND}/auth/me`, { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!data.user || data.user.role !== "super_admin") {
          router.push("/admin/qcm");
          return;
        }
        setUser(data.user);
      } catch (err) {
        console.error("[SuperAdminLayout] Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { href: "/super-admin", label: "Dashboard", icon: "📊" },
    { href: "/super-admin/recruiters", label: "Recruteurs", icon: "👥" },
    { href: "/super-admin/qcms", label: "QCMs", icon: "📝" },
    { href: "/super-admin/candidates", label: "Candidats", icon: "🎯" },
    { href: "/super-admin/config", label: "Configuration", icon: "⚙️" },
  ];

  return (
    <>
      {/* Navigation Super Admin */}
      <nav className="bg-white border-b border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Super Admin</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/super-admin" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">{user.email}</span>
              <Link
                href="/admin/qcm"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Retour Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </>
  );
}

