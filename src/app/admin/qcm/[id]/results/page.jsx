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
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredScoreSegment, setHoveredScoreSegment] = useState(null);

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

    // Taux de réussite basé sur le total des candidats (pas seulement ceux qui ont terminé)
    const passRate = items.length > 0 
      ? Math.round((passed.length / items.length) * 100) 
      : 0;

    // Top 5 candidats - triés par overall_score, mais affichant le QCM score
    const topCandidates = [...finished]
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5)
      .map((it) => ({
        email: it.candidate_email || "—",
        score: it.score || 0, // QCM Score pour l'affichage
        overallScore: it.overall_score || 0, // Overall Score pour le tri
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
          
          {/* Dashboard Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Donut Chart */}
            <div>
              <DashboardDonutChart
                stats={dashboardStats}
                hoveredSegment={hoveredSegment}
                onSegmentHover={setHoveredSegment}
              />
            </div>

            {/* Score Distribution Donut Chart */}
            <div>
              <ScoreDonutChart
                distribution={dashboardStats.scoreDistribution}
                hoveredSegment={hoveredScoreSegment}
                onSegmentHover={setHoveredScoreSegment}
              />
            </div>
          </div>

          {/* Show Top Candidates Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowDashboardDetails(!showDashboardDetails)}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline hover:opacity-80"
            >
              {showDashboardDetails ? "Hide top candidates" : "Show top candidates"}
            </button>
          </div>

          {/* Top Candidates - Only visible when showDashboardDetails is true */}
          {showDashboardDetails && dashboardStats.topCandidates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
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
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Overall:</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {candidate.overallScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">QCM:</span>
                          <span
                            className={`text-sm font-semibold ${
                              candidate.passed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {candidate.score}%
                          </span>
                        </div>
                      </div>
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
                  <Th>QCM Score</Th>
                  <Th>Overall Score</Th>
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
                    <td colSpan={9} className="py-6 text-center text-gray-500">
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
                        <Td>
                          {it.overall_score !== null && it.overall_score !== undefined
                            ? `${it.overall_score}%`
                            : "—"}
                        </Td>
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

function DashboardDonutChart({ stats, hoveredSegment, onSegmentHover }) {
  const size = 300;
  const radius = 100;
  const innerRadius = 60;
  const centerX = size / 2;
  const centerY = size / 2;

  // Vérifier si stats existe
  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-sm text-gray-500 text-center py-8">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Préparer les données pour le graphique - seulement les statuts (pas le total)
  const allSegments = [
    {
      id: "passed",
      label: "Réussis",
      value: stats.passed || 0,
      color: "#10B981", // green
      icon: "✅",
    },
    {
      id: "failed",
      label: "Échoués",
      value: stats.failed || 0,
      color: "#EF4444", // red
      icon: "❌",
    },
    {
      id: "ongoing",
      label: "En Cours",
      value: stats.ongoing || 0,
      color: "#F59E0B", // yellow
      icon: "🔄",
    },
  ];
  
  // Filtrer seulement pour le graphique (pas pour la légende)
  const segments = allSegments.filter((seg) => seg.value > 0);

  // Calculer les angles pour chaque segment - basé sur le total des candidats
  const total = stats.total || 0;
  
  // Si aucun segment ou total est 0, afficher un graphique vide
  if (segments.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-gray-400">{total}</div>
            <div className="text-sm text-gray-500">Total Candidats</div>
            <div className="text-xs text-gray-400 mt-1">0% réussite</div>
          </div>
        </div>
        <div className="w-full space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Statistiques</h3>
          <div className="text-sm text-gray-500 text-center py-4">
            Aucun candidat pour le moment
          </div>
        </div>
      </div>
    );
  }

  let currentAngle = -90; // Commencer en haut

  const pathData = segments.map((seg) => {
    // Calculer le pourcentage basé sur le total des candidats
    const percentage = total > 0 ? seg.value / total : 0;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Convertir les angles en radians
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    // Gérer le cas où le segment occupe 100% (cercle complet)
    let path;
    if (Math.abs(angle - 360) < 0.01) {
      // Cercle complet - créer un anneau avec deux cercles (even-odd rule)
      // Commencer par le cercle externe (sens horaire)
      const outerStart = centerX + radius;
      const outerEnd = centerX - radius;
      // Cercle externe complet
      const outerArc1 = `M ${outerStart} ${centerY} A ${radius} ${radius} 0 1 1 ${outerEnd} ${centerY}`;
      const outerArc2 = `A ${radius} ${radius} 0 1 1 ${outerStart} ${centerY}`;
      // Cercle interne (sens anti-horaire pour créer le trou)
      const innerStart = centerX + innerRadius;
      const innerEnd = centerX - innerRadius;
      const innerArc1 = `M ${innerStart} ${centerY} A ${innerRadius} ${innerRadius} 0 1 0 ${innerEnd} ${centerY}`;
      const innerArc2 = `A ${innerRadius} ${innerRadius} 0 1 0 ${innerStart} ${centerY}`;
      path = `${outerArc1} ${outerArc2} ${innerArc1} ${innerArc2} Z`;
    } else {
      // Arc normal
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      // Coordonnées pour l'arc interne
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        `Z`,
      ].join(" ");
    }

    const segmentData = {
      ...seg,
      path,
      startAngle,
      endAngle,
      percentage: (percentage * 100).toFixed(1),
      midAngle: startAngle + angle / 2,
    };

    currentAngle = endAngle;
    return segmentData;
  });

  // Trouver le segment survolé pour le tooltip
  const hoveredData = pathData.find((seg) => seg.id === hoveredSegment);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Graphique Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {pathData.map((seg) => {
            const isFullCircle = Math.abs(parseFloat(seg.percentage) - 100) < 0.01;
            return isFullCircle ? (
              // Pour un cercle complet, utiliser deux cercles avec fill-rule="evenodd"
              <g
                key={seg.id}
                className="cursor-pointer transition-opacity"
                style={{
                  opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
                }}
                onMouseEnter={() => onSegmentHover(seg.id)}
                onMouseLeave={() => onSegmentHover(null)}
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={seg.color}
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius}
                  fill="white"
                />
              </g>
            ) : (
              <path
                key={seg.id}
                d={seg.path}
                fill={seg.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-opacity"
                style={{
                  opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
                }}
                onMouseEnter={() => onSegmentHover(seg.id)}
                onMouseLeave={() => onSegmentHover(null)}
              />
            );
          })}
        </svg>

        {/* Centre du donut avec statistiques principales */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Candidats</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.passRate}% réussite
          </div>
        </div>

        {/* Tooltip */}
        {hoveredData && (
          <div
            className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: centerX + (radius + 20) * Math.cos((hoveredData.midAngle * Math.PI) / 180),
              top: centerY + (radius + 20) * Math.sin((hoveredData.midAngle * Math.PI) / 180),
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center gap-2">
              <span>{hoveredData.icon}</span>
              <div>
                <div className="font-semibold text-sm">{hoveredData.label}</div>
                <div className="text-xs opacity-90">
                  {hoveredData.value} ({hoveredData.percentage}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="w-full space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Statistiques</h3>
        
        {/* Total Candidats - séparé */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-4 h-4 rounded-full bg-gray-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Total Candidats
            </div>
            <div className="text-xs text-gray-500">
              {stats.total} candidat{stats.total > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Segments du graphique */}
        {allSegments.map((seg) => {
          const segData = pathData.find((s) => s.id === seg.id);
          const percentage = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={seg.id}
              className="flex items-center gap-3 cursor-pointer transition-opacity"
              style={{
                opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
              }}
              onMouseEnter={() => onSegmentHover(seg.id)}
              onMouseLeave={() => onSegmentHover(null)}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {seg.label}
                </div>
                <div className="text-xs text-gray-500">
                  {seg.value} candidat{seg.value > 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {percentage}%
              </div>
            </div>
          );
        })}
        
        {/* Statistiques supplémentaires */}
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Score Moyen:</span>
            <span className="font-semibold text-gray-900">{stats.avgScore}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Durée Moyenne:</span>
            <span className="font-semibold text-gray-900">
              {formatDuration(stats.avgDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreDonutChart({ distribution, hoveredSegment, onSegmentHover }) {
  const size = 300;
  const radius = 100;
  const innerRadius = 60;
  const centerX = size / 2;
  const centerY = size / 2;

  // Vérifier si distribution existe
  if (!distribution) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-sm text-gray-500 text-center py-8">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Préparer les données pour le graphique - seulement les tranches avec des valeurs > 0
  const allSegments = [
    {
      id: "0-20",
      label: "0-20%",
      value: distribution["0-20"] || 0,
      color: "#EF4444", // red
    },
    {
      id: "21-40",
      label: "21-40%",
      value: distribution["21-40"] || 0,
      color: "#F59E0B", // orange
    },
    {
      id: "41-60",
      label: "41-60%",
      value: distribution["41-60"] || 0,
      color: "#EAB308", // yellow
    },
    {
      id: "61-80",
      label: "61-80%",
      value: distribution["61-80"] || 0,
      color: "#3B82F6", // blue
    },
    {
      id: "81-100",
      label: "81-100%",
      value: distribution["81-100"] || 0,
      color: "#10B981", // green
    },
  ];
  
  // Filtrer seulement pour le graphique (pas pour la légende)
  const segments = allSegments.filter((seg) => seg.value > 0);

  // Calculer le total pour les pourcentages
  const total = allSegments.reduce((sum, seg) => sum + seg.value, 0);
  
  // Si aucun segment, afficher un message
  if (segments.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-gray-400">0</div>
            <div className="text-sm text-gray-500">Candidats</div>
            <div className="text-xs text-gray-400 mt-1">avec score</div>
          </div>
        </div>
        <div className="w-full space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Distribution des Scores
          </h3>
          <div className="text-sm text-gray-500 text-center py-4">
            Aucun candidat n'a encore complété le test
          </div>
        </div>
      </div>
    );
  }

  let currentAngle = -90; // Commencer en haut

  const pathData = segments.map((seg) => {
    // Calculer le pourcentage basé sur le total
    const percentage = total > 0 ? seg.value / total : 0;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Convertir les angles en radians
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    // Gérer le cas où le segment occupe 100% (cercle complet)
    let path;
    if (Math.abs(angle - 360) < 0.01) {
      // Cercle complet - utiliser deux arcs pour créer un anneau complet
      path = [
        `M ${centerX + radius} ${centerY}`,
        `A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`,
        `A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`,
        `M ${centerX + innerRadius} ${centerY}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}`,
        `Z`,
      ].join(" ");
    } else {
      // Arc normal
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      // Coordonnées pour l'arc interne
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        `Z`,
      ].join(" ");
    }

    const segmentData = {
      ...seg,
      path,
      startAngle,
      endAngle,
      percentage: total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0",
      midAngle: startAngle + angle / 2,
    };

    currentAngle = endAngle;
    return segmentData;
  });

  // Trouver le segment survolé pour le tooltip
  const hoveredData = pathData.find((seg) => seg.id === hoveredSegment);

  // Calculer le total des candidats qui ont un score
  const totalCandidates = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Graphique Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {pathData.map((seg) => {
            const isFullCircle = Math.abs(parseFloat(seg.percentage) - 100) < 0.01;
            return isFullCircle ? (
              // Pour un cercle complet, utiliser deux cercles avec fill-rule="evenodd"
              <g
                key={seg.id}
                className="cursor-pointer transition-opacity"
                style={{
                  opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
                }}
                onMouseEnter={() => onSegmentHover(seg.id)}
                onMouseLeave={() => onSegmentHover(null)}
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill={seg.color}
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius}
                  fill="white"
                />
              </g>
            ) : (
              <path
                key={seg.id}
                d={seg.path}
                fill={seg.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-opacity"
                style={{
                  opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
                }}
                onMouseEnter={() => onSegmentHover(seg.id)}
                onMouseLeave={() => onSegmentHover(null)}
              />
            );
          })}
        </svg>

        {/* Centre du donut avec statistiques principales */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-gray-900">{totalCandidates}</div>
          <div className="text-sm text-gray-600">Candidats</div>
          <div className="text-xs text-gray-500 mt-1">
            avec score
          </div>
        </div>

        {/* Tooltip */}
        {hoveredData && (
          <div
            className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
            style={{
              left: centerX + (radius + 20) * Math.cos((hoveredData.midAngle * Math.PI) / 180),
              top: centerY + (radius + 20) * Math.sin((hoveredData.midAngle * Math.PI) / 180),
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="flex items-center gap-2">
              <div>
                <div className="font-semibold text-sm">{hoveredData.label}</div>
                <div className="text-xs opacity-90">
                  {hoveredData.value} candidat{hoveredData.value > 1 ? "s" : ""} ({hoveredData.percentage}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="w-full space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
          Distribution des Scores
        </h3>
        
        {/* Total Candidats - séparé */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-4 h-4 rounded-full bg-gray-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Total avec Score
            </div>
            <div className="text-xs text-gray-500">
              {totalCandidates} candidat{totalCandidates > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Segments du graphique */}
        {allSegments.map((seg) => {
          const segData = pathData.find((s) => s.id === seg.id);
          const percentage = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={seg.id}
              className="flex items-center gap-3 cursor-pointer transition-opacity"
              style={{
                opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1,
              }}
              onMouseEnter={() => onSegmentHover(seg.id)}
              onMouseLeave={() => onSegmentHover(null)}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {seg.label}
                </div>
                <div className="text-xs text-gray-500">
                  {seg.value} candidat{seg.value > 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    "qcm_score",
    "overall_score",
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
        r.overall_score !== null && r.overall_score !== undefined ? r.overall_score : "",
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
