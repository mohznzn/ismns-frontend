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
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "mailto:bonjour@ismns.com", label: "bonjour@ismns.com" },
      { href: "https://www.linkedin.com", label: "LinkedIn" },
    ],
  },
  {
    title: "Clients",
    links: [
      { href: "/admin/billing", label: "Facturation" },
      { href: "/admin/settings", label: "Paramètres" },
      { href: "/login", label: "Connexion" },
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
  const isCandidateSurface = pathname?.startsWith("/invite") || pathname?.startsWith("/test");
  if (isCandidateSurface) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-20 w-full max-w-6xl px-4 pb-12">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-xl shadow-gray-200/70">
        <div className="grid gap-12 md:grid-cols-[2fr,repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
              ISMNS
            </Link>
            <p className="max-w-sm text-sm text-gray-600">
              Plateforme SaaS pour générer, diffuser et analyser des QCM IA sécurisés sur l’ensemble de votre parcours de
              recrutement.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <Link href="/pricing" className="rounded-full bg-gray-900 px-4 py-1.5 text-white transition hover:bg-gray-700">
                Voir les tarifs
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
              >
                Planifier une démo
              </Link>
            </div>
          </div>
          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    {link.href.startsWith("http") || link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        className="text-gray-600 transition hover:text-gray-900"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link className="text-gray-600 transition hover:text-gray-900" href={link.href}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {year} ISMNS. Tous droits réservés.</span>
          <span>Made in Paris & Montréal.</span>
        </div>
      </div>
    </footer>
  );
}
