// src/app/admin/qcm/[id]/results/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function QcmResultsPage() {
  const { id } = useParams(); // QCM id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qcm, setQcm] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | ongoing | finished | passed | failed
  const [downloadingId, setDownloadingId] = useState(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState(null);
  const [showDashboardDetails, setShowDashboardDetails] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await admin.getQcmResults(id);
        if (!alive) return;
        setQcm(data.qcm);
        setItems(data.items || []);
      } catch (err) {
        if (!alive) return;
        setError(
          err?.data?.message ||
            err?.data?.error ||
            err?.message ||
            `API error ${err?.status || ""}`.trim()
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleViewCv = (e, attemptId) => {
    e.preventDefault();
    e.stopPropagation();
    const cvUrl = admin.getAttemptCvUrl(attemptId);
    setSelectedCvUrl(cvUrl);
    setCvModalOpen(true);
  };

  const handleDownloadReport = async (e, attemptId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!attemptId || downloadingId) {
      console.log("[handleDownloadReport] Skipping: attemptId=", attemptId, "downloadingId=", downloadingId);
      return;
    }
    console.log("[handleDownloadReport] Starting download for attempt:", attemptId);
    try {
      setDownloadingId(attemptId);
      console.log("[handleDownloadReport] Calling API...");
      const { blob, filename } = await admin.downloadAttemptAIReportPdf(attemptId);
      console.log("[handleDownloadReport] Got blob, size:", blob.size, "filename:", filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("[handleDownloadReport] Download triggered successfully");
    } catch (err) {
      console.error("[handleDownloadReport] Failed to download AI report", err);
      const message = err?.userMessage || err?.message || "Impossible de télécharger le rapport.";
      if (typeof window !== "undefined") {
        alert(message);
      } else {
        setError(message);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // statut dérivé (ongoing/passed/failed/finished)
  const derivedStatus = (it) => {
    const base = (it.status || "").toLowerCase();
    if (base === "finished") {
      if (typeof it.passed === "boolean") return it.passed ? "passed" : "failed";
      return "finished";
    }
    return base || "—";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((it) => {
      const txt = `${it.candidate_email || ""} ${it.status || ""}`.toLowerCase();
      const okQuery = q ? txt.includes(q) : true;
      const st = derivedStatus(it);
      const okStatus = status === "all" ? true : st === status;
      return okQuery && okStatus;
    });
  }, [items, query, status]);

  // Calcul des statistiques pour le dashboard
  const dashboardStats = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        ongoing: 0,
        passRate: 0,
        avgScore: 0,
        avgDuration: 0,
        topCandidates: [],
        scoreDistribution: {
          "0-20": 0,
          "21-40": 0,
          "41-60": 0,
          "61-80": 0,
          "81-100": 0,
        },
      };
    }

    const finished = items.filter((it) => it.status === "finished");
    const passed = finished.filter((it) => it.passed === true);
    const failed = finished.filter((it) => it.passed === false);
    const ongoing = items.filter((it) => it.status === "ongoing");

    const scores = finished.map((it) => it.score || 0).filter((s) => s > 0);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;

    const durations = finished.map((it) => it.duration_s || 0).filter((d) => d > 0);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const passRate = finished.length > 0 
      ? Math.round((passed.length / finished.length) * 100) 
      : 0;

    // Top 5 candidats
    const topCandidates = [...finished]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5)
      .map((it) => ({
        email: it.candidate_email || "—",
        score: it.score || 0,
        passed: it.passed,
      }));

    // Distribution des scores
    const scoreDistribution = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };
    scores.forEach((score) => {
      if (score <= 20) scoreDistribution["0-20"]++;
      else if (score <= 40) scoreDistribution["21-40"]++;
      else if (score <= 60) scoreDistribution["41-60"]++;
      else if (score <= 80) scoreDistribution["61-80"]++;
      else scoreDistribution["81-100"]++;
    });

    return {
      total: items.length,
      passed: passed.length,
      failed: failed.length,
      ongoing: ongoing.length,
      passRate,
      avgScore,
      avgDuration,
      topCandidates,
      scoreDistribution,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results</h1>
        <Link
          href={`/admin/qcm/${id}/review`}
          className="text-sm underline hover:opacity-80"
          prefetch={false}
        >
          ← Back to review
        </Link>
      </div>

      {/* QCM meta */}
      <div className="bg-white shadow rounded-2xl p-6">
        {qcm ? (
          <div className="grid gap-4 sm:grid-cols-4 text-sm">
            <div className="min-w-0 sm:col-span-2">
              <div className="text-gray-500">Job description</div>
              <div
                className={`${
                  qcm.jd_preview ? "font-medium text-gray-900 truncate" : "font-mono break-all"
                }`}
                title={qcm.jd_preview || qcm.id}
              >
                {qcm.jd_preview || qcm.id}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Language</div>
              <div className="font-semibold">{qcm.language}</div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <StatusBadge value={qcm.status} />
              {typeof qcm.pass_threshold === "number" && (
                <div className="text-xs text-gray-500 mt-1">
                  Pass threshold: <strong>{qcm.pass_threshold}%</strong>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading QCM…</div>
        )}
      </div>

      {/* Dashboard Section */}
      {!loading && !error && items.length > 0 && (
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Total Candidats"
              value={dashboardStats.total}
              icon="👥"
            />
            <StatCard
              label="Taux de Réussite"
              value={`${dashboardStats.passRate}%`}
              icon="✅"
              color={dashboardStats.passRate >= 50 ? "green" : "red"}
            />
            <StatCard
              label="Score Moyen"
              value={`${dashboardStats.avgScore}%`}
              icon="📊"
            />
            <StatCard
              label="Durée Moyenne"
              value={formatDuration(dashboardStats.avgDuration)}
              icon="⏱️"
            />
            <StatCard
              label="En Cours"
              value={dashboardStats.ongoing}
              icon="🔄"
            />
          </div>

          {/* See More Details Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowDashboardDetails(!showDashboardDetails)}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline hover:opacity-80"
            >
              {showDashboardDetails ? "Hide details" : "See more details"}
            </button>
          </div>

          {/* Charts Row - Only visible when showDashboardDetails is true */}
          {showDashboardDetails && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Répartition par Statut
                  </h3>
                  <StatusChart
                    passed={dashboardStats.passed}
                    failed={dashboardStats.failed}
                    ongoing={dashboardStats.ongoing}
                  />
                </div>

                {/* Score Distribution */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Distribution des Scores
                  </h3>
                  <ScoreDistributionChart distribution={dashboardStats.scoreDistribution} />
                </div>
              </div>

              {/* Top Candidates */}
              {dashboardStats.topCandidates.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Top 5 Candidats
                  </h3>
                  <div className="space-y-2">
                    {dashboardStats.topCandidates.map((candidate, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">
                            #{idx + 1}
                          </span>
                          <span className="text-sm text-gray-900">
                            {candidate.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              candidate.passed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {candidate.score}%
                          </span>
                          {candidate.passed ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Passed
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tools / Filters */}
      <div className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="finished">Finished (unknown)</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidate…"
            className="border rounded-lg px-3 py-2 text-sm w-56"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          {filtered.length} / {items.length}
          <button
            onClick={() => downloadCsv(filtered)}
            className="ml-3 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      {error && <div className="text-sm text-red-600">API error: {error}</div>}
      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {!loading && !error && (
        <div className="bg-white shadow rounded-2xl p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-gray-50">
                  <Th>Candidate</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th>Started</Th>
                  <Th>Finished</Th>
                  <Th>Duration</Th>
                  <Th>CV</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No attempts yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => {
                    const st = derivedStatus(it);
                    return (
                      <tr key={it.attempt_id} className="border-b">
                        <Td>{it.candidate_email || "—"}</Td>
                        <Td>
                          <AttemptBadge status={st} />
                        </Td>
                        <Td>{isNil(it.score) ? "—" : `${it.score}%`}</Td>
                        <Td>{formatDate(it.started_at)}</Td>
                        <Td>{formatDate(it.finished_at)}</Td>
                        <Td>{formatDuration(it.duration_s)}</Td>
                        <Td onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleViewCv(e, it.attempt_id)}
                            className="text-blue-600 hover:text-blue-800 underline hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={!it.has_cv}
                            style={{ background: "none", border: "none", padding: 0, font: "inherit" }}
                            title={!it.has_cv ? "Le candidat n'a pas importé son CV" : ""}
                          >
                            View CV
                          </button>
                        </Td>
                        <Td onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadReport(e, it.attempt_id);
                            }}
                            className="text-blue-600 hover:text-blue-800 underline hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            disabled={downloadingId === it.attempt_id || !it.has_cv}
                            style={{ background: "none", border: "none", padding: 0, font: "inherit" }}
                            title={!it.has_cv ? "Le candidat n'a pas importé son CV" : ""}
                          >
                            {downloadingId === it.attempt_id ? "Downloading…" : "Report"}
                          </button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {cvModalOpen && selectedCvUrl && (
        <CvModal
          cvUrl={selectedCvUrl}
          onClose={() => {
            setCvModalOpen(false);
            setSelectedCvUrl(null);
          }}
        />
      )}
    </div>
  );
}

/* ───────────────── helpers UI ───────────────── */

function Th({ children }) {
  return <th className="py-2 px-4 font-medium text-gray-700">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`py-2 px-4 ${className}`}>{children}</td>;
}

function StatusBadge({ value }) {
  const v = (value || "").toLowerCase();
  const cls =
    v === "published" || v === "finished"
      ? "bg-green-100 text-green-800"
      : v === "draft" || v === "ongoing"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`}>
      {capitalize(v || "—")}
    </span>
  );
}

function AttemptBadge({ status }) {
  const v = (status || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-800";
  if (v === "passed") cls = "bg-green-100 text-green-800";
  else if (v === "failed") cls = "bg-red-100 text-red-800";
  else if (v === "ongoing") cls = "bg-yellow-100 text-yellow-800";
  else if (v === "finished") cls = "bg-blue-100 text-blue-800";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`}>
      {capitalize(v || "—")}
    </span>
  );
}

/* ───────────────── helpers data ───────────────── */

function isNil(x) {
  return x === null || x === undefined;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDuration(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}m ${ss}s`;
}

function toCsvRow(arr) {
  return arr
    .map((v) => {
      const val = v ?? "";
      const needsQuotes = /[",\n]/.test(String(val));
      const escaped = String(val).replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    })
    .join(",");
}

/* ───────────────── Dashboard Components ───────────────── */

function StatCard({ label, value, icon, color = "gray" }) {
  const colorClasses = {
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    blue: "bg-blue-50 border-blue-200",
    gray: "bg-gray-50 border-gray-200",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function StatusChart({ passed, failed, ongoing }) {
  const total = passed + failed + ongoing;
  if (total === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Aucune donnée disponible
      </div>
    );
  }

  const passedPercent = (passed / total) * 100;
  const failedPercent = (failed / total) * 100;
  const ongoingPercent = (ongoing / total) * 100;

  return (
    <div className="space-y-3">
      {/* Bar Chart */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Passed ({passed})</span>
            <span>{Math.round(passedPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${passedPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Failed ({failed})</span>
            <span>{Math.round(failedPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all"
              style={{ width: `${failedPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Ongoing ({ongoing})</span>
            <span>{Math.round(ongoingPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all"
              style={{ width: `${ongoingPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreDistributionChart({ distribution }) {
  const max = Math.max(...Object.values(distribution));
  if (max === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(distribution).map(([range, count]) => {
        const percent = max > 0 ? (count / max) * 100 : 0;
        return (
          <div key={range}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{range}% ({count})</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────── CV Modal Component ───────────────── */

function CvModal({ cvUrl, onClose }) {
  useEffect(() => {
    // Fermer avec la touche Escape
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    // Empêcher le scroll du body quand le modal est ouvert
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">CV du candidat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={cvUrl}
            className="w-full h-full border-0"
            title="CV Viewer"
            style={{ minHeight: "600px" }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function downloadCsv(rows) {
  const header = [
    "attempt_id",
    "candidate_email",
    "status_derived",
    "score",
    "started_at",
    "finished_at",
    "duration_s",
    "passed",
  ];
  const lines = [
    toCsvRow(header),
    ...rows.map((r) =>
      toCsvRow([
        r.attempt_id,
        r.candidate_email || "",
        (r.status || "").toLowerCase() === "finished"
          ? typeof r.passed === "boolean"
            ? r.passed
              ? "passed"
              : "failed"
            : "finished"
          : (r.status || ""),
        isNil(r.score) ? "" : r.score,
        r.started_at || "",
        r.finished_at || "",
        isNil(r.duration_s) ? "" : r.duration_s,
        typeof r.passed === "boolean" ? r.passed : "",
      ])
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qcm_${Date.now()}_results.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
