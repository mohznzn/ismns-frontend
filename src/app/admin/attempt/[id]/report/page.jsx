// src/app/admin/attempt/[id]/report/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function AttemptReportPage() {
  const { id } = useParams();        // attemptId
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report</h1>
        <Link href={`/admin/qcm/${report?.qcm?.id || ""}/results`} className="text-sm underline hover:opacity-80" prefetch={false}>
          ← Back to results
        </Link>
      </div>

      {/* Meta card — même design */}
      <div className="bg-white shadow rounded-2xl p-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : err ? (
          <div className="text-sm text-red-600">API error: {err}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <div className="text-gray-500">Candidate</div>
              <div className="font-medium">{report.candidate_email || "—"}</div>
            </div>
            <div>
              <div className="text-gray-500">Score</div>
              <div className="font-semibold">{report.score}%</div>
            </div>
            <div>
              <div className="text-gray-500">Pass threshold</div>
              <div className="font-semibold">{report.pass_threshold}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Matching + Résumé */}
      {!loading && !err && (
        <>
          <div className="bg-white shadow rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Matching summary</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {report.matching?.summary || "—"}
            </p>
            <div className="text-sm text-gray-500">Overall match: <span className="font-semibold">{report.matching?.score ?? "—"}%</span></div>
          </div>

          {/* Sections analytiques */}
          <div className="bg-white shadow rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Strengths & Risks</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Strengths</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {(report.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Risks / Gaps</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {(report.risks || []).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* CV & pièces jointes */}
          <div className="bg-white shadow rounded-2xl p-6 space-y-3">
            <h2 className="text-lg font-semibold">Attachments</h2>
            {report.cv && report.cv.filename ? (
              <a
                href={report.cv.download_url}
                className="text-sm underline hover:opacity-80"
                target="_blank"
                rel="noreferrer"
              >
                Download CV ({report.cv.filename})
              </a>
            ) : (
              <div className="text-sm text-gray-500">No CV.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
