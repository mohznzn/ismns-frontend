// src/app/register/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await register(email, password);
      router.push("/admin/myqcms");
    } catch (e) {
      setErr(e.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">Register to start generating QCMs.</p>

        {!!err && <p className="text-sm text-red-600 mb-4">{err}</p>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required
            />
          </div>
          <button
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-black text-white py-2.5 hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
