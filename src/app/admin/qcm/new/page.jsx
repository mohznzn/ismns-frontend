"use client";

import { useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function NewQcmPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND}/qcm/create_draft_from_jd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, language }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      window.location.href = `/admin/qcm/${data.qcm_id}/review`;
    } catch (err) {
      setError(err.message || "Unknown error");
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
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
