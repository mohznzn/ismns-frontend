"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function QcmResultsPage() {
  const params = useParams();
  const qcmId = useMemo(() => {
    const v = params?.id;
    return Array.isArray(v) ? v[0] : v || "";
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qcm, setQcm] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!qcmId) {
      setErr("Missing QCM id.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/admin/qcm/${encodeURIComponent(qcmId)}/results`);
        const text = await r.text();
        const data = text ? JSON.parse(text) : null;
        if (!r.ok) throw new Error(data?.message || data?.error || `HTTP ${r.status}`);

        // Attendu idéal: { qcm: {...}, attempts: [...], stats?: {...} }
        setQcm(data?.qcm ?? null);
        const atts = Array.isArray(data?.attempts) ? data.attempts : [];
        // Tri par date desc si dispo
        atts.sort((a, b) => new Date(b.started_at || 0) - new Date(a.started_at || 0));
        setAttempts(atts);

        // Stats basiques si non fournies
        if (data?.stats) {
          setStats(data.stats);
        } else {
          const total = atts.length;
          const finished = atts.filter(a => a.finished_at).length;
          const avg =
            total > 0
              ? Math.round(
                  atts.reduce(
                    (sum, a) => sum + (a.score_pct ?? a.score ?? 0),
                    0
                  ) / total
                )
              : 0;
          setStats({
            attempts_count: total,
            finished_count: finished,
            completion_rate: total ? Math.round((finished / total) * 100) : 0,
            avg_score: avg,
          });
        }
        setErr("");
      } catch (e) {
        setErr(e.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    })();
  }, [qcmId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading results…
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Results error</h1>
          <p className="text-sm text-red-600">{err}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header QCM */}
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Assessment results</h1>
              <p className="text-gray-600 mt-1">
                QCM: <span className="font-medium">{qcm?.id}</span>{" "}
                {qcm?.language ? (
                  <span className="text-sm text-gray-500">• Lang: {qcm.language}</span>
                ) : null}
              </p>
              {qcm?.status && (
                <div className="mt-2 inline-flex text-xs px-2 py-1 rounded-full border border-gray-200">
                  Status: {qcm.status}
                </div>
              )}
            </div>
            <Link
              href={`/admin/qcm/${encodeURIComponent(qcmId)}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
            >
              Back to draft
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-2xl p-5">
            <div className="text-sm text-gray-500">Attempts</div>
            <div className="text-3xl font-bold">{stats?.attempts_count ?? 0}</div>
          </div>
          <div className="bg-white shadow rounded-2xl p-5">
            <div className="text-sm text-gray-500">Avg score</div>
            <div className="text-3xl font-bold">{stats?.avg_score ?? 0}%</div>
          </div>
          <div className="bg-white shadow rounded-2xl p-5">
            <div className="text-sm text-gray-500">Completion rate</div>
            <div className="text-3xl font-bold">{stats?.completion_rate ?? 0}%</div>
          </div>
        </div>

        {/* Attempts list */}
        <div className="bg-white shadow rounded-2xl p-2">
          {attempts.length === 0 ? (
            <div className="p-6 text-gray-600">No attempts yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {attempts.map((a) => {
                const score = a.score_pct ?? a.score ?? 0;
                const total = a.total_questions ?? a.questions_count ?? 0;
                const who =
                  a.candidate_name ||
                  a.candidate_email ||
                  a.email ||
                  "Anonymous candidate";
                return (
                  <li key={a.id} className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-500">{who}</div>
                        <div className="text-base font-medium mt-0.5">
                          Score: {score}%{" "}
                          {typeof a.correct_count === "number" && total ? (
                            <span className="text-gray-500">
                              ({a.correct_count}/{total})
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {a.started_at ? `Started: ${a.started_at}` : null}
                          {a.finished_at ? ` • Finished: ${a.finished_at}` : null}
                          {typeof a.duration_s === "number"
                            ? ` • Duration: ${a.duration_s}s`
                            : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/attempts/${encodeURIComponent(a.id)}`}
                          className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
