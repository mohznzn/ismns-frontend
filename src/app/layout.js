// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "ISMNS QCM",
  description: "Generate and share AI-powered QCMs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        {/* HEADER (admin/recruteur) */}
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
          <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
            <Link href="/" className="font-semibold hover:opacity-80">ISMNS</Link>

            {/* Liens utiles recruteur */}
            <div className="flex items-center gap-6 text-sm">
              {/* Créer un nouveau QCM */}
              <Link href="/admin/qcm/new" className="hover:text-blue-600">New QCM</Link>

              {/* Liste de tous les QCM (hub admin) */}
              <Link href="/admin/qcm" className="hover:text-blue-600">My QCMs</Link>

              {/* Accès rapide aux résultats (même hub, tu sélectionnes un QCM et cliques 'View results') */}
              <Link href="/admin/qcm" className="hover:text-blue-600">Results</Link>

              {/* (Optionnel) page d’aide partage, si tu en crées une plus tard */}
              {/* <Link href="/admin/help" className="hover:text-blue-600">Help</Link> */}
            </div>
          </nav>
        </header>

        {/* CONTENU */}
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
          © {new Date().getFullYear()} ISMNS
        </footer>
      </body>
    </html>
  );
}
