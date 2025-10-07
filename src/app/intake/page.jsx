// src/app/intake/page.jsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { publicApi } from "@/lib/api";

export default function IntakePage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <IntakeInner />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
      Loading…
    </div>
  );
}

function IntakeInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const attemptId = useMemo(() => sp.get("attempt_id") || "", [sp]);

  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("EUR");
  const [salaryPeriod, setSalaryPeriod] = useState("year"); // "year" | "month"
  const [availability, setAvailability] = useState("");

  const [cvFile, setCvFile] = useState(null); // <- upload fichier obligatoire

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!attemptId) setErr("Missing attempt_id");
  }, [attemptId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!attemptId) return;
    if (!cvFile) {
      setErr("Veuillez joindre votre CV (PDF, DOC/DOCX, RTF ou TXT).");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      await publicApi.intakeAttempt(attemptId, {
        salary_amount: salaryAmount ? Number(salaryAmount) : null,
        salary_currency: salaryCurrency,
        salary_period: salaryPeriod,
        availability_text: availability?.trim() || "",
        cv_file: cvFile, // <— fichier requis
      });
      setOk(true);
    } catch (e) {
      setErr(
        e?.data?.message ||
          e?.data?.error ||
          e?.message ||
          `API error ${e?.status || ""}`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Next steps</h1>
        </div>

        <div className="bg-white shadow rounded-2xl p-6">
          {!attemptId ? (
            <div className="text-sm text-red-600">Missing attempt_id.</div>
          ) : ok ? (
            <div className="space-y-3">
              <div className="text-green-700 font-medium">
                Merci ! Vos informations ont bien été envoyées. Nous revenons vers vous très vite.
              </div>
              <div>
                <button
                  onClick={() => router.replace("/")}
                  className="mt-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
                >
                  Retour à l’accueil
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {err && <div className="text-sm text-red-600">API error: {err}</div>}

              {/* Salary */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Prétentions salariales
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    placeholder="ex: 45000"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value)}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <select
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                  </select>
                  <select
                    value={salaryPeriod}
                    onChange={(e) => setSalaryPeriod(e.target.value)}
                    className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="year">/an</option>
                    <option value="month">/mois</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Indiquez un montant brut (ex: 45 000 EUR/an).
                </p>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Disponibilités (texte libre)
                </label>
                <textarea
                  rows={4}
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="Ex: Semaine prochaine, mar–jeu 14h–18h, fuseau Europe/Paris"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* CV upload – requis */}
              <div className="space-y-2">
                <label className="block text-sm mb-1 font-medium">
                  CV (upload obligatoire)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.rtf,.txt"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
                  required
                />
                <div className="text-xs text-gray-500">
                  Formats acceptés : PDF, DOC/DOCX, RTF, TXT (max ~10 Mo).
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  {loading ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
