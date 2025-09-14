// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
        <ClientProviders>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-8">
            {children}
          </main>
          <SiteFooter />
        </ClientProviders>
      </body>
    </html>
  );
}
