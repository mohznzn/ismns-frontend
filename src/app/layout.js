// src/app/layout.js
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Essaie d'utiliser NEXT_PUBLIC_API_BASE sinon NEXT_PUBLIC_BACKEND_URL
const RAW_API =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

function isAbsoluteHttpUrl(u) {
  return /^https?:\/\//i.test(u || "");
}

// Si l'env ne fournit qu'un host, force https
function normalizeForPreconnect(u) {
  if (!u) return "";
  if (isAbsoluteHttpUrl(u)) return u.replace(/\/+$/, "");
  return `https://${u}`.replace(/\/+$/, "");
}

const PRECONNECT_API = normalizeForPreconnect(RAW_API);

export const metadata = {
  title: "ISMNS QCM",
  description: "Generate and share AI-powered QCMs",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Accélère la 1ʳᵉ requête /auth/me */}
        {PRECONNECT_API && (
          <>
            <link rel="dns-prefetch" href={PRECONNECT_API} />
            <link rel="preconnect" href={PRECONNECT_API} crossOrigin="" />
          </>
        )}
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        <ClientProviders>
          <SiteHeader />

          {/* Fallback léger pendant l’hydratation (ex: pages qui lisent useSearchParams) */}
          <Suspense
            fallback={
              <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="h-6 w-40 rounded bg-gray-100 animate-pulse mb-4" />
                <div className="h-32 w-full rounded-xl bg-gray-100 animate-pulse" />
              </main>
            }
          >
            {/* Conteneur commun : marketing et app partagent la même largeur par défaut */}
            <main className="mx-auto max-w-6xl px-4 py-8">
              {children}
            </main>
          </Suspense>

          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
}
