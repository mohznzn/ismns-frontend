"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setInfo("");
    try {
      await auth.forgotPassword(email);
      setInfo("A 6-digit reset code has been sent to your email.");
      setStep(2);
    } catch (error) {
      setErr(error?.data?.message || error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    if (newPw !== confirmPw) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(email, code, newPw);
      setInfo("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 2000);
    } catch (error) {
      setErr(error?.data?.message || error?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-4">
          {step === 1
            ? "Enter your email to receive a reset code."
            : "Enter the code and your new password."}
        </p>

        {err && (
          <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {err}
          </div>
        )}
        {info && (
          <div className="mb-3 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            {info}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={onRequestCode} className="space-y-3">
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
            <button
              disabled={loading}
              className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onResetPassword} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Reset code</label>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full border rounded-xl px-3 py-2 text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                Check your inbox for the 6-digit code
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">New password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading}
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
            <button
              disabled={loading}
              className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <Link className="text-blue-600 hover:underline" href="/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
