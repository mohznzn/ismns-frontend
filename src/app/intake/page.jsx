"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_MB = 15;
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

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

  const [cvFile, setCvFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    if (!attemptId) setErr("Missing attempt_id");
  }, [attemptId]);

  const validateFile = (file) => {
    if (!file) return "Veuillez joindre votre CV.";
    const name = file.name || "";
    const dot = name.lastIndexOf(".");
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
    if (!ALLOWED_EXT.includes(ext)) {
      return `Extension non autorisée. Formats acceptés : ${ALLOWED_EXT.join(", ")}`;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      return `Fichier trop volumineux (max ${MAX_MB} Mo).`;
    }
    return null;
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setCvFile(f);
    if (f) setErr(validateFile(f) || "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!attemptId) return;

    const fileErr = validateFile(cvFile);
    if (fileErr) {
      setErr(fileErr);
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    if (!baseUrl) {
      setErr("NEXT_PUBLIC_BACKEND_URL manquant côté front.");
      return;
    }

    setLoading(true);
    setErr("");
    setOk(false);
    setAiSummary(null);

    const fd = new FormData();
    if (salaryAmount) fd.append("salary_amount", String(Number(salaryAmount)));
    if (salaryCurrency) fd.append("salary_currency", salaryCurrency);
    if (salaryPeriod) fd.append("salary_period", salaryPeriod);
    if (availability?.trim()) fd.append("availability_text", availability.trim());
    fd.append("cv_file", cvFile);

    const url = `${baseUrl.replace(/\/$/, "")}/attempts/${encodeURIComponent(
      attemptId
    )}/intake?ephemeral=1`;

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "X-Ephemeral": "1" }, // hint côté backend
        body: fd,
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      const data = await safeJson(res);

      if (data?.ai_report) setAiSummary(data.ai_report);
      setOk(true);
    } catch (e) {
      setErr(e?.message || "API error");
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
            <div className="space-y-4">
              <div className="text-green-700 font-medium">
                Merci ! Vos informations ont bien été envoyées.
              </div>

              {aiSummary && (
                <div className="rounded-xl border p-4 space-y-2">
                  <div className="text-sm font-semibold">Résumé IA</div>
                  <AIReportView report={aiSummary} />
                </div>
              )}

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

              {/* CV upload */}
              <div className="space-y-2">
                <label className="block text-sm mb-1 font-medium">
                  CV (upload obligatoire)
                </label>
                <input
                  type="file"
                  accept={ALLOWED_EXT.join(",")}
                  onChange={onFileChange}
                  className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
                  required
                />
                <div className="text-xs text-gray-500">
                  Formats acceptés : {ALLOWED_EXT.join(", ")} (max ~{MAX_MB} Mo).
                </div>
                {cvFile && (
                  <div className="text-xs text-gray-600">
                    Sélectionné : <b>{cvFile.name}</b>{" "}
                    <span className="text-gray-400">
                      ({(cvFile.size / (1024 * 1024)).toFixed(1)} Mo)
                    </span>
                  </div>
                )}
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

function AIReportView({ report }) {
  if (!report || typeof report !== "object") {
    return <div className="text-sm text-gray-500">—</div>;
  }
  const overall = typeof report.overall_score === "number" ? `${report.overall_score}%` : "—";
  const comps = report.components || {};
  const list = (arr) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <ul className="list-disc list-inside space-y-1">
        {arr.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    ) : (
      <span className="text-gray-400">—</span>
    );

  return (
    <div className="space-y-2 text-sm">
      <div>Score global: <b>{overall}</b></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <Metric label="Keyword match" v={comps.keyword_match} />
        <Metric label="Skills fit" v={comps.skills_fit} />
        <Metric label="QCM score" v={comps.qcm_score} />
        <Metric label="Seniority fit" v={comps.seniority_fit} />
      </div>
      <Section title="Forces">{list(report.strengths)}</Section>
      <Section title="Gaps">{list(report.gaps)}</Section>
      <Section title="Risques">{list(report.risks)}</Section>
      <Section title="Recommandations">{list(report.recommendations)}</Section>
      {report.decision?.label && (
        <div>
          Décision: <b>{report.decision.label}</b> — {report.decision.reason || ""}
        </div>
      )}
      {report.vision_insights && (
        <VisionInsights insights={report.vision_insights} />
      )}
    </div>
  );
}

function VisionInsights({ insights }) {
  if (!insights || typeof insights !== "object") return null;
  
  const quality = insights.visual_quality || "—";
  const layout = insights.layout_type || "—";
  const structure = typeof insights.structure_score === "number" ? `${insights.structure_score}%` : "—";
  const hasPhoto = insights.has_photo === true ? "Oui" : insights.has_photo === false ? "Non" : "—";
  const richness = insights.content_richness || "—";
  const sections = Array.isArray(insights.sections_detected) ? insights.sections_detected : [];
  const notes = insights.visual_notes || "";
  
  return (
    <div className="border-t pt-3 mt-3 space-y-2">
      <div className="font-medium text-sm">📄 Analyse visuelle du CV</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Qualité visuelle:</span>{" "}
          <span className="font-medium">{quality}</span>
        </div>
        <div>
          <span className="text-gray-500">Layout:</span>{" "}
          <span className="font-medium">{layout}</span>
        </div>
        <div>
          <span className="text-gray-500">Structure:</span>{" "}
          <span className="font-medium">{structure}</span>
        </div>
        <div>
          <span className="text-gray-500">Photo:</span>{" "}
          <span className="font-medium">{hasPhoto}</span>
        </div>
      </div>
      {sections.length > 0 && (
        <div className="text-xs">
          <span className="text-gray-500">Sections détectées:</span>{" "}
          <span className="text-gray-700">{sections.join(", ")}</span>
        </div>
      )}
      {richness && richness !== "—" && (
        <div className="text-xs">
          <span className="text-gray-500">Richesse du contenu:</span>{" "}
          <span className="font-medium">{richness}</span>
        </div>
      )}
      {notes && (
        <div className="text-xs text-gray-600 italic">{notes}</div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
function Metric({ label, v }) {
  const value = typeof v === "number" ? `${v}%` : "—";
  return (
    <div className="rounded-lg border p-2">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
