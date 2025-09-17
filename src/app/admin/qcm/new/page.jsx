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
        job_description: jobDescription,
        language,
        num_questions: 12,
      });
      const id = data?.qcm_id;
      if (!id) throw new Error("Missing qcm_id in response");
      router.replace(`/admin/qcm/${id}/review`);
    } catch (err) {
      setError(
        err?.data?.error || err?.message || `API error ${err?.status || ""}`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <h1>Create QCM from Job Description</h1>

      <form onSubmit={onSubmit}>
        <label>Language</label>
        <br />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>

        <br />
        <br />

        <label>Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the JD here..."
          rows={10}
          style={{ width: "100%" }}
          required
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate draft"}
        </button>

        {error && <p style={{ color: "red" }}>API error: {error}</p>}
      </form>
    </div>
  );
}
