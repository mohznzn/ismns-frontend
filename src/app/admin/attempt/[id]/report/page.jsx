// src/app/admin/attempt/[id]/report/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function AttemptReportPage() {
  const { id } = useParams(); // attempt id
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [report, setReport] = useState(null); // payload de /admin/attempts/:id/report

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await admin.getAttemptReport(id);
        if (!alive) return;
        setReport(data);
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
  const score = typeof report?.attempt?.score === "number" ? report.attempt.score : null;
  const passThreshold = typeof report?.attempt?.pass_threshold === "number"
    ? report.attempt.pass_threshold
    : 70;

  // CV: /admin/attempts/:id/cv (exposé par app.py dans report.cv.url)
  const cvUrl = report?.cv?.url || null;
  const cvFilename = report?.cv?.filename || (cvUrl ? cvUrl.split("/").pop() : null);
  const cvTextExtracted = !!report?.cv?.text_extracted;

  const jdPreview = report?.qcm?.jd_preview || "—";
  const matchingScore = typeof report?.matching?.score === "number" ? report.matching.score : null;
  const overallMatch = useMemo(() => {
    if (typeof matchingScore === "number") return matchingScore;
    if (typeof score === "number") return score; // fallback simple
    return 0;
  }, [matchingScore, score]);

  const jdKw = Array.isArray(report?.matching?.jd_keywords) ? report.matching.jd_keywords : [];
  const cvKw = Array.isArray(report?.matching?.cv_keywords) ? report.matching.cv_keywords : [];
  const matchingExplain = report?.matching?.explanation || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidate report</h1>
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

      {/* Meta card */}
      <div className="bg-white shadow rounded-2xl p-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : err ? (
          <div className="text-sm text-red-600">API error: {err}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="min-w-0">
              <div className="text-gray-500">Candidate</div>
              <div className="font-medium truncate" title={candidateEmail}>
                {candidateEmail}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Score</div>
              <div className="font-semibold">
                {typeof score === "number" ? `${score}%` : "—"}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Pass threshold</div>
              <div className="font-semibold">{passThreshold}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Matching summary */}
      {!loading && !err && (
        <div className="bg-white shadow rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Matching summary</h2>
          <p className="text-sm text-gray-600">{jdPreview}</p>
          <div className="text-sm">
            Overall match: <strong>{overallMatch}%</strong>
          </div>
          <p className="text-xs text-gray-500">{matchingExplain}</p>

          {/* Keywords (aperçu) */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">JD keywords</div>
              <TagList items={jdKw.slice(0, 15)} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                CV keywords {cvTextExtracted ? "" : "(no text extracted)"}
              </div>
              <TagList items={cvKw.slice(0, 15)} />
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Risks */}
      {!loading && !err && (
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Strengths & Risks</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-medium mb-2">Strengths</div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {typeof score === "number" && score >= passThreshold ? (
                  <>
                    <li>Above threshold: solid baseline on assessed skills.</li>
                    <li>Good test completion suggests strong fundamentals.</li>
                  </>
                ) : (
                  <>
                    <li>Demonstrates baseline knowledge on tested topics.</li>
                    <li>Motivation to complete the screening flow.</li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Risks / Gaps</div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {typeof score === "number" && score < passThreshold ? (
                  <>
                    <li>Below threshold: plan a follow-up technical screen.</li>
                    <li>Consider more hands-on tasks to validate skills.</li>
                  </>
                ) : (
                  <>
                    <li>Validate real-world skills with a short exercise.</li>
                    <li>Check experience depth vs. job seniority.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
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
            <div className="text-sm text-gray-500">No CV.</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────── UI helpers ───────────── */

function TagList({ items }) {
  if (!items || items.length === 0) {
    return <div className="text-xs text-gray-400">—</div>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t, i) => (
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
