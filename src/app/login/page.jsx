"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const router = useRouter();
  const search = useSearchParams();
  const { refresh } = useAuth(); // ✅ pour maj le header après login

  // ✅ route par défaut corrigée + on n'autorise que des chemins internes
  const next = (() => {
    const n = search.get("next") || "/admin/qcm";
    return n.startsWith("/") ? n : "/admin/qcm";
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const result = await auth.login(email, pw, verificationCode || undefined);
      
      // Vérifier si la vérification d'email est requise
      if (result?.error === "email_not_verified" || result?.requires_verification) {
        setRequiresVerification(true);
        setErr(result?.message || "Your email has not been verified. A verification code has been sent.");
        // Rediriger vers la page de vérification avec le contexte "login"
        router.push(`/verify-email?email=${encodeURIComponent(email)}&user_id=${result?.user_id || ""}&context=login`);
        return;
      }
      
      // Vérifier si le 2FA est requis
      if (result?.error === "verification_required") {
        setRequires2FA(true);
        setErr(result?.message || "Please enter the verification code sent to your email.");
        return;
      }
      
      // Connexion réussie
      await refresh();             // ✅ met à jour le contexte Auth (user rempli)
      router.replace(next);        // redirection
    } catch (e) {
      const errorMessage = e?.data?.message || e?.data?.error || e?.message || "Login failed";
      setErr(errorMessage);
      
      // Vérifier si c'est une erreur de vérification d'email
      if (e?.status === 403 && e?.data?.error === "email_not_verified") {
        setRequiresVerification(true);
        router.push(`/verify-email?email=${encodeURIComponent(email)}&user_id=${e?.data?.user_id || ""}&context=login`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-4">Access your dashboard</p>
        
        {err && (
          <div className={`mb-3 p-3 text-sm rounded-lg ${
            requiresVerification || requires2FA 
              ? "text-blue-600 bg-blue-50" 
              : "text-red-600 bg-red-50"
          }`}>
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setRequires2FA(false);
                setErr("");
              }}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="you@company.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setRequires2FA(false);
                setErr("");
              }}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          {requires2FA && (
            <div>
              <label className="block text-sm mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                  setErr("");
                }}
                className="w-full border rounded-xl px-3 py-2 text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>
          )}
          
          <button
            disabled={loading}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          No account?{" "}
          <Link className="text-blue-600 hover:underline" href="/register">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // Obligatoire avec Next 15 quand on utilise useSearchParams
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
