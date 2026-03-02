// src/app/admin/qcm/[id]/results/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function QcmResultsPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qcm, setQcm] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState(null);
  const [reportProgress, setReportProgress] = useState(null);
  const [addingSlotsOpen, setAddingSlotsOpen] = useState(false);
  const [slotsToAdd, setSlotsToAdd] = useState("");
  const [addingSlotsLoading, setAddingSlotsLoading] = useState(false);

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
        setError(err?.data?.message || err?.data?.error || err?.message || `API error ${err?.status || ""}`.trim());
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

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

  const stats = useMemo(() => {
    if (!items || items.length === 0) return null;
    const finished = items.filter(it => it.status === "finished");
    const passed = finished.filter(it => it.passed === true);
    const failed = finished.filter(it => it.passed === false);
    const ongoing = items.filter(it => it.status === "ongoing");
    const scores = finished.map(it => it.score || 0).filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const durations = finished.map(it => it.duration_s || 0).filter(d => d > 0);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const passRate = items.length > 0 ? Math.round((passed.length / items.length) * 100) : 0;

    const scoreDist = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
    scores.forEach(s => {
      if (s <= 20) scoreDist["0-20"]++;
      else if (s <= 40) scoreDist["21-40"]++;
      else if (s <= 60) scoreDist["41-60"]++;
      else if (s <= 80) scoreDist["61-80"]++;
      else scoreDist["81-100"]++;
    });

    const topCandidates = [...finished]
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5)
      .map(it => ({
        email: it.candidate_email || "—",
        score: it.score || 0,
        overallScore: it.overall_score || 0,
        passed: it.passed,
      }));

    return { total: items.length, passed: passed.length, failed: failed.length, ongoing: ongoing.length, passRate, avgScore, avgDuration, scoreDist, topCandidates };
  }, [items]);

  const handleAddSlots = async () => {
    const n = parseInt(slotsToAdd, 10);
    if (isNaN(n) || n < 1) return;
    try {
      setAddingSlotsLoading(true);
      const res = await admin.addCandidateSlots(id, n);
      setQcm(prev => prev ? { ...prev, max_candidates: res.max_candidates, candidates_count: res.candidates_count } : prev);
      setSlotsToAdd("");
      setAddingSlotsOpen(false);
    } catch (err) {
      alert(err?.message || "Error adding slots");
    } finally {
      setAddingSlotsLoading(false);
    }
  };

  const handleViewCv = (e, attemptId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCvUrl(admin.getAttemptCvUrl(attemptId));
    setCvModalOpen(true);
  };

  const handleDownloadReport = async (e, attemptId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!attemptId || downloadingId) return;
    try {
      setDownloadingId(attemptId);
      setReportProgress(null);
      const { blob, filename } = await admin.downloadAttemptAIReportPdf(attemptId, false, (p) => setReportProgress(p));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.userMessage || err?.message || "Failed to download the report.");
    } finally {
      setDownloadingId(null);
      setReportProgress(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results</h1>
        <Link href={`/admin/qcm/${id}/review`} className="text-sm text-gray-500 hover:text-gray-900" prefetch={false}>
          ← Back to review
        </Link>
      </div>

      {/* QCM meta */}
      {qcm && (
        <div className="bg-white shadow rounded-xl p-4 space-y-3 overflow-hidden">
          <div className="flex flex-wrap gap-x-8 gap-y-2 items-center text-sm">
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-gray-500">Job: </span>
              <span className="font-medium text-gray-900" title={qcm.jd_preview || qcm.id}>
                {(qcm.jd_preview || qcm.id || "").length > 80
                  ? (qcm.jd_preview || qcm.id).slice(0, 80) + "…"
                  : (qcm.jd_preview || qcm.id)}
              </span>
            </div>
            <div><span className="text-gray-500">Lang: </span><span className="font-semibold">{qcm.language}</span></div>
            <div className="flex items-center gap-2">
              <StatusBadge value={qcm.status} />
              {typeof qcm.pass_threshold === "number" && (
                <span className="text-xs text-gray-500">Pass: {qcm.pass_threshold}%</span>
              )}
            </div>
          </div>

          {/* Quota bar */}
          {qcm.max_candidates != null && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Candidate slots used</span>
                  <span className="font-medium">{qcm.candidates_count ?? items.length} / {qcm.max_candidates}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    ((qcm.candidates_count ?? items.length) / qcm.max_candidates) >= 1 ? "bg-red-500" :
                    ((qcm.candidates_count ?? items.length) / qcm.max_candidates) >= 0.8 ? "bg-yellow-500" : "bg-green-500"
                  }`} style={{ width: `${Math.min(100, ((qcm.candidates_count ?? items.length) / qcm.max_candidates) * 100)}%` }} />
                </div>
              </div>
              {addingSlotsOpen ? (
                <div className="flex items-center gap-1">
                  <input type="number" min="1" value={slotsToAdd} onChange={e => setSlotsToAdd(e.target.value)}
                    placeholder="Qty" className="w-16 px-2 py-1 border rounded text-sm" />
                  <button onClick={handleAddSlots} disabled={addingSlotsLoading || !slotsToAdd}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50 hover:bg-blue-700">
                    {addingSlotsLoading ? "..." : "Add"}
                  </button>
                  <button onClick={() => setAddingSlotsOpen(false)} className="px-2 py-1 border rounded text-xs hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setAddingSlotsOpen(true)}
                  className="px-3 py-1 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50">
                  + Add slots
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">API error: {error}</div>}
      {loading && <div className="text-sm text-gray-500 py-8 text-center">Loading...</div>}

      {/* Dashboard */}
      {!loading && !error && stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total" value={stats.total} color="bg-gray-50 border-gray-200" />
            <StatCard label="Passed" value={stats.passed} color="bg-green-50 border-green-200" valueColor="text-green-700" />
            <StatCard label="Failed" value={stats.failed} color="bg-red-50 border-red-200" valueColor="text-red-700" />
            <StatCard label="In Progress" value={stats.ongoing} color="bg-yellow-50 border-yellow-200" valueColor="text-yellow-700" />
            <StatCard label="Avg Score" value={`${stats.avgScore}%`} color="bg-blue-50 border-blue-200" valueColor="text-blue-700" />
            <StatCard label="Avg Duration" value={fmtDur(stats.avgDuration)} color="bg-purple-50 border-purple-200" valueColor="text-purple-700" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Status breakdown */}
            <div className="bg-white shadow rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
              <BarChart items={[
                { label: "Passed", value: stats.passed, total: stats.total, color: "bg-green-500" },
                { label: "Failed", value: stats.failed, total: stats.total, color: "bg-red-500" },
                { label: "In Progress", value: stats.ongoing, total: stats.total, color: "bg-yellow-500" },
              ]} />
              <div className="mt-3 text-center">
                <span className="text-2xl font-bold text-gray-900">{stats.passRate}%</span>
                <span className="text-sm text-gray-500 ml-1">pass rate</span>
              </div>
            </div>

            {/* Score distribution */}
            <div className="bg-white shadow rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h3>
              {(() => {
                const max = Math.max(...Object.values(stats.scoreDist), 1);
                const colors = { "0-20": "bg-red-500", "21-40": "bg-orange-400", "41-60": "bg-yellow-500", "61-80": "bg-blue-500", "81-100": "bg-green-500" };
                return (
                  <div className="space-y-2">
                    {Object.entries(stats.scoreDist).map(([range, count]) => (
                      <div key={range} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12 text-right">{range}%</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div className={`${colors[range]} h-full rounded-full transition-all flex items-center justify-end pr-1`}
                            style={{ width: `${Math.max(count > 0 ? 8 : 0, (count / max) * 100)}%` }}>
                            {count > 0 && <span className="text-[10px] text-white font-medium">{count}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Top candidates */}
            <div className="bg-white shadow rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 5 Candidates</h3>
              {stats.topCandidates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No finished candidates yet</p>
              ) : (
                <div className="space-y-2">
                  {stats.topCandidates.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 font-bold w-5 text-right">#{i + 1}</span>
                      <span className="flex-1 truncate text-gray-800">{c.email}</span>
                      <span className="text-xs text-gray-500">{c.score}%</span>
                      <span className={`text-xs font-semibold ${c.overallScore >= 60 ? "text-green-600" : c.overallScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                        {c.overallScore}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div className="bg-white shadow rounded-xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
              <option value="all">All statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search candidate..."
              className="border rounded-lg px-3 py-1.5 text-sm w-48" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {filtered.length} / {items.length}
            <button onClick={() => downloadCsv(filtered)} className="ml-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-3 font-medium text-gray-600">Candidate</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-center">Status</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-center">QCM</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-center">Overall</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-center hidden sm:table-cell">Duration</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-center">CV</th>
                <th className="py-2 px-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No attempts yet.</td></tr>
              ) : filtered.map((it) => {
                const st = derivedStatus(it);
                return (
                  <tr key={it.attempt_id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">{it.candidate_email || "—"}</div>
                      <div className="text-xs text-gray-400">{fmtDate(it.started_at)}</div>
                    </td>
                    <td className="py-2 px-3 text-center"><AttemptBadge status={st} /></td>
                    <td className="py-2 px-3 text-center font-medium">{isNil(it.score) ? "—" : `${it.score}%`}</td>
                    <td className="py-2 px-3 text-center font-medium">
                      {it.overall_score != null ? `${it.overall_score}%` : "—"}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-500 hidden sm:table-cell">{fmtDur(it.duration_s)}</td>
                    <td className="py-2 px-3 text-center">
                      {it.has_cv ? (
                        <button onClick={e => handleViewCv(e, it.attempt_id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          View
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={e => handleDownloadReport(e, it.attempt_id)}
                        disabled={downloadingId === it.attempt_id || !it.has_cv}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        title={!it.has_cv ? "No CV uploaded" : "Download AI report"}>
                        {downloadingId === it.attempt_id
                          ? (reportProgress?.message || reportProgress?.status || "Generating...")
                          : "Report"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CV Modal */}
      {cvModalOpen && selectedCvUrl && (
        <CvModal cvUrl={selectedCvUrl} onClose={() => { setCvModalOpen(false); setSelectedCvUrl(null); }} />
      )}
    </div>
  );
}

/* ─── UI Components ─── */

function StatCard({ label, value, color, valueColor = "text-gray-900" }) {
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-0.5">{label}</div>
    </div>
  );
}

function BarChart({ items }) {
  return (
    <div className="space-y-2">
      {items.map(({ label, value, total, color }) => {
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>{label} ({value})</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ value }) {
  const v = (value || "").toLowerCase();
  const cls = v === "published" || v === "finished" ? "bg-green-100 text-green-800"
    : v === "draft" || v === "ongoing" ? "bg-yellow-100 text-yellow-800"
    : "bg-gray-100 text-gray-800";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`}>{capitalize(v || "—")}</span>;
}

function AttemptBadge({ status }) {
  const v = (status || "").toLowerCase();
  let cls = "bg-gray-100 text-gray-800";
  if (v === "passed") cls = "bg-green-100 text-green-800";
  else if (v === "failed") cls = "bg-red-100 text-red-800";
  else if (v === "ongoing") cls = "bg-yellow-100 text-yellow-800";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`}>{capitalize(v || "—")}</span>;
}

function CvModal({ cvUrl, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = "unset"; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-base font-semibold">Candidate CV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Close">×</button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={cvUrl} className="w-full h-full border-0" title="CV Viewer" />
        </div>
        <div className="p-3 border-t flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function isNil(x) { return x === null || x === undefined; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function fmtDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(); }
  catch { return iso; }
}

function fmtDur(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
}

function toCsvRow(arr) {
  return arr.map(v => { const val = v ?? ""; const escaped = String(val).replace(/"/g, '""'); return /[",\n]/.test(String(val)) ? `"${escaped}"` : escaped; }).join(",");
}

function downloadCsv(rows) {
  const header = ["attempt_id", "candidate_email", "status", "qcm_score", "overall_score", "started_at", "finished_at", "duration_s", "passed"];
  const lines = [
    toCsvRow(header),
    ...rows.map(r => toCsvRow([
      r.attempt_id, r.candidate_email || "",
      (r.status || "").toLowerCase() === "finished" ? (typeof r.passed === "boolean" ? (r.passed ? "passed" : "failed") : "finished") : (r.status || ""),
      isNil(r.score) ? "" : r.score, r.overall_score ?? "", r.started_at || "", r.finished_at || "",
      isNil(r.duration_s) ? "" : r.duration_s, typeof r.passed === "boolean" ? r.passed : "",
    ])),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `qcm_${Date.now()}_results.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
