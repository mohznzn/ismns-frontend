"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess(false);
    try {
      const result = await auth.register(email, pw);
      
      // Vérifier si la vérification est requise
      if (result?.requires_verification) {
        setSuccess(true);
        setUserId(result.user_id);
        // Rediriger vers la page de vérification avec le contexte "register"
        router.push(`/verify-email?email=${encodeURIComponent(email)}&user_id=${result.user_id}&context=register`);
      } else {
        // Ancien comportement (fallback)
        router.replace("/admin/qcm");
      }
    } catch (error) {
      console.error("register error:", error);
      
      // Si c'est une erreur "email_taken" mais que le compte n'est pas vérifié,
      // rediriger vers la page de vérification
      if (error?.status === 409 && error?.data?.error === "email_taken") {
        // Vérifier si on peut réessayer avec le même email
        // En fait, le backend devrait gérer cela, mais au cas où...
        setErr("Cet email est déjà utilisé. Si vous n'avez pas vérifié votre email, essayez de vous connecter ou utilisez un autre email.");
      } else {
        const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Registration failed";
        setErr(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-4">
          Register to start generating QCMs.
        </p>

        {err && <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{err}</div>}
        
        {success && (
          <div className="mb-3 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            Account created! Please check your email for verification code.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPw(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••"
              required
              minLength={8}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
            </p>
          </div>
          <button
            disabled={loading}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-blue-600 hover:underline" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
