// src/app/admin/qcm/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { admin } from "@/lib/api";

export default function NewQcmPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await admin.createDraftFromJD({
        job_description: jobDescription.trim(),
        language,
        // pas de num_questions : backend fixe 20
      });

      const id = data?.qcm_id;
      if (!id) throw new Error("Missing qcm_id in response");
      router.replace(`/admin/qcm/${id}/review`);
    } catch (err) {
      // Montre le message détaillé du backend si disponible
      const apiMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        `API error ${err?.status || ""}`.trim();

      console.error("create_draft_from_jd error:", err);
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
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
            disabled={loading || !jobDescription.trim()}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40"
          >
            {loading ? "Generating…" : "Generate draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
