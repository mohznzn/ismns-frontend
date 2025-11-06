"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

/**
 * Attempt detailed report (recruteur)
 * - Ajoute profil candidat (résumé/skills/salaire/dispo)
 * - Affiche décision + score IA en tête
 * - Barres de progression lisibles
 */
export default function AttemptReportPage() {
  const { id } = useParams(); // attempt id
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [report, setReport] = useState(null);       // /admin/attempts/:id/report
  const [ai, setAi] = useState(null);               // /admin/attempts/:id/ai_report
  const [detail, setDetail] = useState(null);       // /admin/attempts/:id  (intake derivatives)

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) Rapport de base (matching/QCM/attachments)
        const data = await admin.getAttemptReport(id);
        if (!alive) return;
        setReport(data);

        // 2) IA (si calculé)
        try {
          const aiRes = await admin.getAttemptAIReport(id);
          if (alive) setAi(aiRes?.ai_report || null);
        } catch {
          /* silencieux si pas d'analyse IA */
        }

        // 3) Détails attempt → intake (cv_summary, cv_skills, salary_expectation, availability…)
        try {
          if (admin.getAttemptDetail) {
            const det = await admin.getAttemptDetail(id);
            if (alive) setDetail(det || null);
          }
        } catch {
          /* ok si absent côté SDK */
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "API error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // ====== Données + fallbacks sûrs ======
  const candidateEmail = report?.attempt?.candidate_email || "—";
  const score = nOrNull(report?.attempt?.score);
  const passThreshold = nOrNull(report?.attempt?.pass_threshold) ?? 70;

  const jdPreview = report?.qcm?.jd_preview || "—";
  const matchingScore = nOrNull(report?.matching?.score);
  const overallMatch = useMemo(() => {
    if (typeof matchingScore === "number") return matchingScore;
    if (typeof score === "number") return score; // fallback simple
    return 0;
  }, [matchingScore, score]);

  const jdKw = arr(report?.matching?.jd_keywords);
  const cvKw = arr(report?.matching?.cv_keywords);

  // Pièces jointes
  const cvUrl = report?.cv?.url || null;
  const cvFilename = report?.cv?.filename || (cvUrl ? cvUrl.split("/").pop() : null);
  const cvTextExtracted = !!report?.cv?.text_extracted;
  const cvEphemeral = !!report?.cv?.ephemeral;

  // Intake (si dispo)
  const intake = detail?.intake || {};
  const cvSummary = str(intake?.cv_summary);
  const cvSkills = arr(intake?.cv_skills);
  const availability = str(intake?.availability);
  const salary = str(intake?.salary_expectation);

  // IA enrichissements
  const aiOverall = nOrNull(ai?.overall_score);
  const components = ai?.components || {};
  const decision = ai?.decision?.label || null;
  const decisionReason = ai?.decision?.reason || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Candidate report</h1>
          {decision && <DecisionBadge label={decision} />}
          {typeof aiOverall === "number" && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
              AI overall: <b>{aiOverall}%</b>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => router.back()} className="underline hover:opacity-80">
            ← Back
          </button>
          {!!report?.qcm?.id && (
            <Link
              href={`/admin/qcm/${report.qcm.id}/results`}
              className="underline hover:opacity-80"
              prefetch={false}
            >
              Back to results
            </Link>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white shadow rounded-2xl p-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : err ? (
          <div className="text-sm text-red-600">API error: {err}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-4 text-sm">
            <KV label="Candidate">
              <span className="font-medium truncate" title={candidateEmail}>{candidateEmail}</span>
            </KV>
            <KV label="QCM score"><b>{pp(score)}</b></KV>
            <KV label="Pass threshold"><b>{passThreshold}%</b></KV>
            <KV label="Overall match (keywords)"><b>{overallMatch}%</b></KV>
          </div>
        )}
      </div>

      {/* Candidate profile (résumé + skills + dispo/salaire) */}
      {!loading && !err && (cvSummary || (cvSkills && cvSkills.length) || availability || salary) && (
        <div className="bg-white shadow rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Candidate profile</h2>
          {cvSummary && <p className="text-sm text-gray-700 leading-6 whitespace-pre-line">{cvSummary}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <KV label="Top skills">
              {cvSkills && cvSkills.length > 0 ? <TagList items={cvSkills.slice(0, 12)} /> : <MutedDash />}
            </KV>
            <div className="grid grid-cols-2 gap-4">
              <KV label="Availability">{availability || <MutedDash />}</KV>
              <KV label="Salary">{salary || <MutedDash />}</KV>
            </div>
          </div>
        </div>
      )}

      {/* Rapport professionnel structuré */}
      {!loading && !err && ai && (
        <div className="bg-white shadow rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-xl font-semibold">Rapport de recrutement</h2>
            <div className="flex items-center gap-3">
              {decision && <DecisionBadge label={decision} />}
              {typeof aiOverall === "number" && (
                <span className="text-sm font-medium">Score global: <b>{pp(aiOverall)}</b></span>
              )}
            </div>
          </div>

          {/* Informations candidat */}
          {ai.candidate_info && (ai.candidate_info.first_name || ai.candidate_info.last_name || ai.candidate_info.email) && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm font-semibold mb-2 text-blue-900">Informations candidat</div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {(ai.candidate_info.first_name || ai.candidate_info.last_name) && (
                  <div>
                    <span className="text-gray-600">Nom complet: </span>
                    <span className="font-medium">{[ai.candidate_info.first_name, ai.candidate_info.last_name].filter(Boolean).join(" ")}</span>
                  </div>
                )}
                {ai.candidate_info.email && (
                  <div>
                    <span className="text-gray-600">Email: </span>
                    <span className="font-medium">{ai.candidate_info.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contexte du besoin (JD) */}
          {ai.jd_context && (
            <div>
              <div className="text-sm font-semibold mb-2 text-gray-900">Contexte du besoin</div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4">
                {ai.jd_context}
              </div>
            </div>
          )}

          {/* Snapshot candidat */}
          {ai.candidate_snapshot && (
            <div>
              <div className="text-sm font-semibold mb-2 text-gray-900">Snapshot candidat (extrait du CV)</div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4">
                {ai.candidate_snapshot}
              </div>
            </div>
          )}

          {/* Score QCM */}
          {typeof ai.qcm_score === "number" && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-sm font-semibold mb-2 text-yellow-900">Score QCM</div>
              <div className="text-2xl font-bold text-yellow-800">{ai.qcm_score}%</div>
              <div className="text-xs text-yellow-700 mt-1">
                Seuil de passage: {passThreshold}% {ai.qcm_score >= passThreshold ? "✓ Passé" : "✗ En dessous"}
              </div>
            </div>
          )}

          {/* Forces / Lacunes / Risques */}
          <div className="grid md:grid-cols-3 gap-4">
            {ai.strengths && Array.isArray(ai.strengths) && ai.strengths.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2 text-green-700">Forces</div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {ai.strengths.map((s, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ai.gaps && Array.isArray(ai.gaps) && ai.gaps.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2 text-orange-700">Lacunes</div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {ai.gaps.map((g, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-orange-600 mr-2">⚠</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ai.risks && Array.isArray(ai.risks) && ai.risks.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2 text-red-700">Risques</div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {ai.risks.map((r, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-600 mr-2">!</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disponibilité et préavis */}
          {(ai.availability || ai.notice_period) && (
            <div className="grid md:grid-cols-2 gap-4">
              {ai.availability && (
                <div>
                  <div className="text-sm font-semibold mb-1 text-gray-700">Disponibilité</div>
                  <div className="text-sm text-gray-600">{ai.availability}</div>
                </div>
              )}
              {ai.notice_period && (
                <div>
                  <div className="text-sm font-semibold mb-1 text-gray-700">Préavis</div>
                  <div className="text-sm text-gray-600">{ai.notice_period}</div>
                </div>
              )}
            </div>
          )}

          {/* Prétention salariale */}
          {ai.salary_expectation && (
            <div>
              <div className="text-sm font-semibold mb-1 text-gray-700">Prétention salariale</div>
              <div className="text-sm font-medium text-gray-900">{ai.salary_expectation}</div>
            </div>
          )}

          {/* Vision Insights (si disponible) */}
          {ai.vision_insights && (
            <VisionInsightsSection insights={ai.vision_insights} />
          )}
        </div>
      )}

      {/* Attachments (CV) */}
      {!loading && !err && (
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-3">Attachments</h2>
          {cvUrl ? (
            <div className="text-sm">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Open CV{cvFilename ? ` (${cvFilename})` : ""}
              </a>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {cvEphemeral ? "CV not stored (ephemeral analysis)." : "No CV."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────── UI helpers ───────────── */

function KV({ label, children }) {
  return (
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function MutedDash() {
  return <span className="text-gray-400">—</span>;
}

function TagList({ items }) {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return <div className="text-xs text-gray-400">—</div>;
  return (
    <div className="flex flex-wrap gap-1">
      {arr.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Progress({ label, value }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(100, value)) : null;
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-2 bg-black rounded-full transition-all"
          style={{ width: v === null ? "0%" : `${v}%`, opacity: v === null ? 0.25 : 1 }}
        />
      </div>
      <div className="text-xs text-gray-500">{v === null ? "—" : `${v}%`}</div>
    </div>
  );
}

function Metric({ label, v }) {
  const value = typeof v === "number" ? `${v}%` : "—";
  return (
    <div className="rounded-lg border p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

/* Liste bullets générique */
function List({ title, items }) {
  const arr = Array.isArray(items) ? items : [];
  return (
    <div className="text-sm">
      <div className="font-medium mb-1">{title}</div>
      {arr.length === 0 ? (
        <div className="text-gray-400 text-xs">—</div>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {arr.map((it, i) => (
            <li key={`${title}-${i}`}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Badge décision */
function DecisionBadge({ label }) {
  const tone = getDecisionTone(label);
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full border`}
      style={{
        borderColor: tone.border,
        background: tone.bg,
        color: tone.fg,
      }}
      title="AI decision"
    >
      {label}
    </span>
  );
}

/* ───────────── utils ───────────── */

function nOrNull(x) {
  return typeof x === "number" ? x : null;
}
function str(x) {
  return (typeof x === "string" ? x.trim() : "") || "";
}
function arr(x) {
  return Array.isArray(x) ? x : [];
}
function pp(n) {
  return typeof n === "number" ? `${n}%` : "—";
}
function getDecisionTone(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("proceed")) return tone("#065f46", "#ecfdf5", "#10b981");      // green
  if (l.includes("interview")) return tone("#1e40af", "#eff6ff", "#3b82f6");   // blue
  if (l.includes("hold")) return tone("#92400e", "#fffbeb", "#f59e0b");         // amber
  if (l.includes("reject")) return tone("#7f1d1d", "#fef2f2", "#ef4444");       // red
  return tone("#111827", "#f3f4f6", "#6b7280");                                  // gray
}
function tone(fg, bg, border) {
  return { fg, bg, border };
}

/* Vision Insights Component */
function VisionInsightsSection({ insights }) {
  if (!insights || typeof insights !== "object") return null;
  
  const quality = insights.visual_quality || "—";
  const layout = insights.layout_type || "—";
  const structure = typeof insights.structure_score === "number" ? insights.structure_score : null;
  const hasPhoto = insights.has_photo === true ? "Yes" : insights.has_photo === false ? "No" : "—";
  const richness = insights.content_richness || "—";
  const sections = Array.isArray(insights.sections_detected) ? insights.sections_detected : [];
  const notes = insights.visual_notes || "";
  
  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <span>📄</span> CV Visual Analysis
      </h3>
      
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">
        <KV label="Visual quality">
          <span className="font-medium capitalize">{quality}</span>
        </KV>
        <KV label="Layout type">
          <span className="font-medium capitalize">{layout}</span>
        </KV>
        {structure !== null && (
          <Progress label="Structure score" value={structure} />
        )}
        <KV label="Photo included">
          <span className="font-medium">{hasPhoto}</span>
        </KV>
      </div>
      
      {sections.length > 0 && (
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sections detected</div>
          <TagList items={sections} />
        </div>
      )}
      
      {richness && richness !== "—" && (
        <KV label="Content richness">
          <span className="font-medium capitalize">{richness}</span>
        </KV>
      )}
      
      {notes && (
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Visual notes</div>
          <p className="text-gray-700 italic">{notes}</p>
        </div>
      )}
    </div>
  );
}
