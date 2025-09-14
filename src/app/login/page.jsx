"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin/myqcms";

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await auth.login(email, pw);
      router.replace(next);
    } catch (e) {
      setErr(e?.data?.error || e.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-4">Access your dashboard</p>
        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="you@company.com" required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password" value={pw} onChange={(e)=>setPw(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••••" required
            />
          </div>
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
