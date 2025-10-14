// src/components/SiteFooter.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { href: "/features", label: "Fonctionnalités" },
      { href: "/pricing", label: "Tarifs" },
      { href: "/docs", label: "Documentation" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/support", label: "Support" },
      { href: "/contact", label: "Contact" },
      { href: "/admin/billing", label: "Facturation" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/privacy", label: "Confidentialité" },
      { href: "/legal/terms", label: "Conditions" },
    ],
  },
];

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/invite") || pathname?.startsWith("/test")) return null;

  return (
    <footer className="mx-auto mt-20 w-full max-w-6xl px-4 pb-10 pt-12 text-sm text-gray-500">
      <div className="grid gap-10 border-t border-gray-200 pt-10 md:grid-cols-[2fr,1fr,1fr,1fr]">
        <div className="space-y-3">
          <Link href="/" className="text-base font-semibold text-gray-900">
            ISMNS
          </Link>
          <p className="max-w-sm text-sm text-gray-600">
            Plateforme SaaS pour générer, diffuser et analyser des QCM IA sécurisés sur vos processus de recrutement.
          </p>
        </div>
        {footerLinks.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link className="text-gray-600 transition hover:text-blue-600" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
        <span>© {new Date().getFullYear()} ISMNS. Tous droits réservés.</span>
        <span>Made in Paris & Montréal.</span>
      </div>
    </footer>
  );
}
