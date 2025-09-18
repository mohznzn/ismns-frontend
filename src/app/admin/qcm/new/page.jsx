// src/app/admin/qcm/new/page.jsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/api";

export default function NewQcmPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [numQuestionsRaw, setNumQuestionsRaw] = useState("12"); // texte saisi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Valide et convertit en entier
  const numQuestions = useMemo(() => {
    // n'accepte que les entiers positifs
    const n = Number(numQuestionsRaw);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [numQuestionsRaw]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await admin.createDraftFromJD({
        job_description: jobDescription,
        language,
        num_questions: numQuestions ?? 12,
      });
      const id = data?.qcm_id;
      if (!id) throw new Error("Missing qcm_id in response");
      router.replace(`/admin/qcm/${id}/review`);
    } catch (err) {
      setError(
        err?.data?.error ||
          err?.message ||
          `API error ${err?.status || ""}`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  // empêche la molette de changer le number input quand il est focus
  const preventWheel = (e) => {
    e.currentTarget.blur();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create QCM from Job Description</h1>

      <form
        onSubmit={onSubmit}
        className="bg-white shadow rounded-2xl p-6 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1"># of questions</label>
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              // optionnel: tu peux mettre un max raisonnable, ex. 50
              // max="50"
              value={numQuestionsRaw}
              onChange={(e) => {
                // autorise la frappe libre mais garde le texte brut
                // (on laisse la validation à numQuestions)
                setNumQuestionsRaw(e.target.value.trim());
              }}
              onWheel={preventWheel}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="12"
            />
            {!numQuestions && numQuestionsRaw !== "" && (
              <p className="mt-1 text-xs text-red-600">
                Please enter a whole number &gt; 0.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the JD here..."
            rows={12}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            required
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">API error: {error}</div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !jobDescription.trim() || !numQuestions}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? "Generating…" : "Generate draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
