"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

function VerifyEmailForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  
  const email = searchParams.get("email") || "";
  const userId = searchParams.get("user_id") || "";
  const context = searchParams.get("context") || "register"; // "register" ou "login"

  useEffect(() => {
    if (!email && !userId) {
      router.replace("/register");
    }
  }, [email, userId, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setResendSuccess(false);
    
    if (!code || code.length !== 6) {
      setErr("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }
    
    try {
      const result = await auth.verifyEmail(email, code, userId);
      
      if (result?.ok) {
        // Mettre à jour le contexte auth
        await refresh();
        // Rediriger vers le dashboard
        router.replace("/admin/qcm");
      }
    } catch (error) {
      console.error("verify email error:", error);
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Verification failed";
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    setErr("");
    setResendSuccess(false);
    
    try {
      await auth.resendVerificationCode(email, context);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error("resend error:", error);
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || "Failed to resend code";
      setErr(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setErr("");
  };

  // Texte différencié selon le contexte
  const isLoginContext = context === "login";
  const title = isLoginContext ? "Verify your email to sign in" : "Verify your email";
  const description = isLoginContext 
    ? "We sent a verification code to your email. Please enter it below to complete your sign in."
    : `We sent a verification code to <strong>${email}</strong>`;
  const buttonText = isLoginContext ? "Verify & Sign In" : "Verify Email";
  const backLink = isLoginContext ? "/login" : "/register";
  const backLinkText = isLoginContext ? "Back to login" : "Go back";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>
        <p 
          className="text-sm text-gray-500 mb-4"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {err && <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 rounded-lg">{err}</div>}
        
        {resendSuccess && (
          <div className="mb-3 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            A new verification code has been sent to your email.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 font-medium">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? "Verifying…" : buttonText}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full text-sm text-gray-600 hover:text-gray-800 disabled:opacity-40"
          >
            {resending ? "Sending…" : "Didn't receive the code? Resend"}
          </button>
          
          <div className="text-center text-sm text-gray-600">
            Wrong email?{" "}
            <Link className="text-blue-600 hover:underline" href={backLink}>
              {backLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

