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
  const [attemptDetail, setAttemptDetail] = useState(null); // { attempt, intake, answers }
  const [qcmMeta, setQcmMeta] = useState(null); // { id, language, status, pass_threshold, jd_preview }

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) Détails de la tentative
        const detail = await admin.getAttemptDetail(id);
        if (!alive) return;
        setAttemptDetail(detail);

        // 2) Méta du QCM (pour le seuil & JD)
        const qcmId = detail?.attempt?.qcm_id;
        if (qcmId) {
          const q = await admin.getQcmAdmin(qcmId);
          if (!alive) return;
          setQcmMeta({
            id: q?.qcm?.id,
            language: q?.qcm?.language,
            status: q?.qcm?.status,
            pass_threshold: q?.qcm?.pass_threshold, // renvoyé par ton /admin/qcm/<id>/results (sinon on fallback)
            jd_preview: q?.qcm?.jd_preview,
          });
        }
      } catch (e) {
        if (!alive) return;
        setErr(e?.data?.message || e?.message || "API error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ====== Données affichées ======
  const candidateEmail = attemptDetail?.attempt?.candidate_email || "—";
  const score = typeof attemptDetail?.attempt?.score === "number" ? attemptDetail.attempt.score : null;

  // seuil: priorité à qcmMeta.pass_threshold, sinon essaie de le lire depuis la route Results (tu l’avais)
  const passThreshold = typeof qcmMeta?.pass_threshold === "number" ? qcmMeta.pass_threshold : 70;

  // CV: supporte upload récent (intake.cv.download_url) et ancien champ (cv_url)
  const cvUrl =
    attemptDetail?.intake?.cv?.download_url ||
    attemptDetail?.intake?.cv_download_url ||
    attemptDetail?.intake?.cv_url ||
    null;

  const cvFilename =
    attemptDetail?.intake?.cv?.filename ||
    (cvUrl ? cvUrl.split("/").pop() : null);

  // ====== Matching très simple (placeholder) ======
  // Pour l’instant on utilise le score comme proxy du “overall match”.
  // Tu pourras remplacer par une valeur renvoyée par ton backend (ex: report.overall_match).
  const overallMatch = useMemo(() => {
    if (typeof score === "number") return score;
    return 0;
    // TODO: si ton backend renvoie un "overall_match", utilises-le ici.
  }, [score]);

  // ====== UI ======
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidate report</h1>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => router.back()} className="underline hover:opacity-80">
            ← Back
          </button>
          {qcmMeta?.id && (
            <Link
              href={`/admin/qcm/${qcmMeta.id}/results`}
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
        <div className="bg-white shadow rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">Matching summary</h2>
          <p className="text-sm text-gray-600">
            {qcmMeta?.jd_preview || "—"}
          </p>
          <div className="text-sm">
            Overall match: <strong>{overallMatch}%</strong>
          </div>
        </div>
      )}

      {/* Strengths & Risks (placeholders — à remplacer par ton analyse réelle) */}
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
