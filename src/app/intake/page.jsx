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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("EUR");
  const [salaryPeriod, setSalaryPeriod] = useState("year"); // "year" | "month"
  const [availability, setAvailability] = useState("");
  const [noticePeriod, setNoticePeriod] = useState(""); // préavis

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
    if (firstName?.trim()) fd.append("first_name", firstName.trim());
    if (lastName?.trim()) fd.append("last_name", lastName.trim());
    if (email?.trim()) fd.append("email", email.trim());
    if (salaryAmount) fd.append("salary_amount", String(Number(salaryAmount)));
    if (salaryCurrency) fd.append("salary_currency", salaryCurrency);
    if (salaryPeriod) fd.append("salary_period", salaryPeriod);
    if (availability?.trim()) fd.append("availability_text", availability.trim());
    if (noticePeriod?.trim()) fd.append("notice_period", noticePeriod.trim());
    fd.append("cv_file", cvFile);

    // Log pour déboguer ce qui est envoyé
    console.log("[intake] Sending form data:");
    console.log("[intake] - first_name:", firstName);
    console.log("[intake] - last_name:", lastName);
    console.log("[intake] - email:", email);
    console.log("[intake] - salary_amount:", salaryAmount);
    console.log("[intake] - availability:", availability);
    console.log("[intake] - notice_period:", noticePeriod);
    console.log("[intake] - cv_file:", cvFile?.name, cvFile?.size);

    const url = `${baseUrl.replace(/\/$/, "")}/attempts/${encodeURIComponent(
      attemptId
    )}/intake?ephemeral=1`;

    console.log("[intake] Request URL:", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "X-Ephemeral": "1" }, // hint côté backend
        body: fd,
      });

      console.log("[intake] Response status:", res.status, res.statusText);
      console.log("[intake] Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const data = await safeJson(res);
        console.error("[intake] Error response:", data);
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      const data = await safeJson(res);
      console.log("[intake] ✅ Response received successfully");
      console.log("[intake] Response data keys:", Object.keys(data || {}));
      console.log("[intake] Response data:", data);

      // Vérifier spécifiquement ai_report
      console.log("[intake] ai_report present?", !!data?.ai_report);
      if (data?.ai_report) {
        console.log("[intake] ai_report type:", typeof data.ai_report);
        console.log("[intake] ai_report keys:", Object.keys(data.ai_report));
        console.log("[intake] ai_report content:", JSON.stringify(data.ai_report, null, 2));
        console.log("[intake] ai_report.overall_score:", data.ai_report.overall_score);
        console.log("[intake] ai_report.decision:", data.ai_report.decision);
        console.log("[intake] ai_report.candidate_info:", data.ai_report.candidate_info);
        console.log("[intake] ai_report.jd_context:", data.ai_report.jd_context);
        console.log("[intake] ai_report.candidate_snapshot:", data.ai_report.candidate_snapshot);
        console.log("[intake] ai_report.strengths:", data.ai_report.strengths);
        console.log("[intake] ai_report.gaps:", data.ai_report.gaps);
        console.log("[intake] ai_report.risks:", data.ai_report.risks);
        console.log("[intake] ai_report.availability:", data.ai_report.availability);
        console.log("[intake] ai_report.notice_period:", data.ai_report.notice_period);
        console.log("[intake] ai_report.salary_expectation:", data.ai_report.salary_expectation);
      } else {
        console.warn("[intake] ⚠️ ai_report is missing from response!");
        console.warn("[intake] Available keys in response:", Object.keys(data || {}));
      }

      if (data?.ai_report) {
        console.log("[intake] Setting aiSummary with:", data.ai_report);
        setAiSummary(data.ai_report);
      } else {
        console.warn("[intake] ⚠️ Not setting aiSummary because ai_report is missing");
        setAiSummary(null);
      }
      setOk(true);
    } catch (e) {
      console.error("[intake] ❌ Error:", e);
      console.error("[intake] Error message:", e?.message);
      console.error("[intake] Error stack:", e?.stack);
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

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Jean"
                    required
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Dupont"
                    required
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: jean.dupont@example.com"
                  required
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

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
                  Disponibilités
                </label>
                <textarea
                  rows={3}
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="Ex: Disponible immédiatement, ou à partir du 1er mars"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* Notice Period */}
              <div>
                <label className="block text-sm mb-1 font-medium">
                  Préavis
                </label>
                <input
                  type="text"
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  placeholder="Ex: 2 semaines, 1 mois, immédiat"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Durée de préavis nécessaire avant de pouvoir commencer.
                </p>
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
  // Logs de débogage complets
  console.log("[AIReportView] ========== RENDER ==========");
  console.log("[AIReportView] Report received:", report);
  console.log("[AIReportView] Report type:", typeof report);
  console.log("[AIReportView] Report is null?", report === null);
  console.log("[AIReportView] Report is undefined?", report === undefined);
  console.log("[AIReportView] Report is object?", typeof report === "object");
  
  if (report && typeof report === "object") {
    console.log("[AIReportView] Report keys:", Object.keys(report));
    console.log("[AIReportView] Report.overall_score:", report.overall_score, typeof report.overall_score);
    console.log("[AIReportView] Report.decision:", report.decision, typeof report.decision);
    console.log("[AIReportView] Report.candidate_info:", report.candidate_info);
    console.log("[AIReportView] Report.jd_context:", report.jd_context);
    console.log("[AIReportView] Report.candidate_snapshot:", report.candidate_snapshot);
    console.log("[AIReportView] Report.qcm_score:", report.qcm_score);
    console.log("[AIReportView] Report.strengths:", report.strengths, Array.isArray(report.strengths));
    console.log("[AIReportView] Report.gaps:", report.gaps, Array.isArray(report.gaps));
    console.log("[AIReportView] Report.risks:", report.risks, Array.isArray(report.risks));
    console.log("[AIReportView] Report.availability:", report.availability);
    console.log("[AIReportView] Report.notice_period:", report.notice_period);
    console.log("[AIReportView] Report.salary_expectation:", report.salary_expectation);
    console.log("[AIReportView] Report.vision_insights:", report.vision_insights);
    console.log("[AIReportView] Full report JSON:", JSON.stringify(report, null, 2));
  } else {
    console.warn("[AIReportView] ⚠️ Report is not a valid object!");
  }
  console.log("[AIReportView] ============================");

  if (!report || typeof report !== "object") {
    console.warn("[AIReportView] Returning fallback because report is invalid");
    return <div className="text-sm text-gray-500">—</div>;
  }
  const overall = typeof report.overall_score === "number" ? `${report.overall_score}%` : "—";
  const decision = typeof report.decision === "string" ? report.decision : (report.decision?.label || null);

  return (
    <div className="space-y-4 text-sm">
      {/* Header avec score et décision */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="font-semibold">Score global: <b>{overall}</b></div>
        {decision && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            decision === "proceed" ? "bg-green-100 text-green-800" :
            decision === "interview" ? "bg-blue-100 text-blue-800" :
            decision === "hold" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {decision}
          </span>
        )}
      </div>

      {/* Informations candidat */}
      {report.candidate_info && (report.candidate_info.first_name || report.candidate_info.last_name || report.candidate_info.email) && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="font-medium mb-2 text-blue-900">Informations candidat</div>
          <div className="space-y-1 text-gray-700">
            {(report.candidate_info.first_name || report.candidate_info.last_name) && (
              <div><span className="text-gray-600">Nom: </span><span className="font-medium">{[report.candidate_info.first_name, report.candidate_info.last_name].filter(Boolean).join(" ")}</span></div>
            )}
            {report.candidate_info.email && (
              <div><span className="text-gray-600">Email: </span><span className="font-medium">{report.candidate_info.email}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Contexte du besoin */}
      {report.jd_context && (
        <div>
          <div className="font-medium mb-1 text-gray-900">Contexte du besoin</div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
            {report.jd_context}
          </div>
        </div>
      )}

      {/* Snapshot candidat */}
      {report.candidate_snapshot && (
        <div>
          <div className="font-medium mb-1 text-gray-900">Snapshot candidat</div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
            {report.candidate_snapshot}
          </div>
        </div>
      )}

      {/* Score QCM */}
      {typeof report.qcm_score === "number" && (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="font-medium mb-1 text-yellow-900">Score QCM</div>
          <div className="text-xl font-bold text-yellow-800">{report.qcm_score}%</div>
        </div>
      )}

      {/* Forces / Lacunes / Risques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {report.strengths && Array.isArray(report.strengths) && report.strengths.length > 0 && (
          <div>
            <div className="font-medium mb-1 text-green-700">Forces</div>
            <ul className="space-y-1 text-gray-700 text-xs">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-1">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.gaps && Array.isArray(report.gaps) && report.gaps.length > 0 && (
          <div>
            <div className="font-medium mb-1 text-orange-700">Lacunes</div>
            <ul className="space-y-1 text-gray-700 text-xs">
              {report.gaps.map((g, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-orange-600 mr-1">⚠</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.risks && Array.isArray(report.risks) && report.risks.length > 0 && (
          <div>
            <div className="font-medium mb-1 text-red-700">Risques</div>
            <ul className="space-y-1 text-gray-700 text-xs">
              {report.risks.map((r, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-red-600 mr-1">!</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Disponibilité et préavis */}
      {(report.availability || report.notice_period) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.availability && (
            <div>
              <div className="font-medium mb-1 text-gray-700">Disponibilité</div>
              <div className="text-gray-600">{report.availability}</div>
            </div>
          )}
          {report.notice_period && (
            <div>
              <div className="font-medium mb-1 text-gray-700">Préavis</div>
              <div className="text-gray-600">{report.notice_period}</div>
            </div>
          )}
        </div>
      )}

      {/* Prétention salariale */}
      {report.salary_expectation && (
        <div>
          <div className="font-medium mb-1 text-gray-700">Prétention salariale</div>
          <div className="font-medium text-gray-900">{report.salary_expectation}</div>
        </div>
      )}

      {/* Vision Insights (si disponible) */}
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
