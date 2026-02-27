"use client";

import { useEffect, useState, useRef } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminCandidates() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [filters, setFilters] = useState({
    owner_email: "", email: "", status: "", score_min: "", score_max: "", date_from: "", date_to: "",
  });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters]);

  useEffect(() => { loadAttempts(); }, [page, debouncedFilters]);

  async function loadAttempts() {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
      Object.entries(debouncedFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`${BACKEND}/super-admin/attempts?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setAttempts(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("[Candidates] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(attempt) {
    setDetail({ ...attempt, full: null });
    setDetailLoading(true);
    try {
      const res = await fetch(`${BACKEND}/admin/attempts/${attempt.attempt_id}`, { credentials: "include" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setDetail(prev => prev ? { ...prev, full: json } : null);
    } catch (err) {
      console.error("[Detail] Load failed:", err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(attemptId) {
    if (!confirm("Are you sure you want to delete this attempt?")) return;
    try {
      const res = await fetch(`${BACKEND}/super-admin/attempts/${attemptId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Error");
      loadAttempts();
      if (detail?.attempt_id === attemptId) setDetail(null);
    } catch { alert("Error deleting"); }
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`${BACKEND}/super-admin/attempts?${params}&page_size=10000`, { credentials: "include" });
      if (!res.ok) throw new Error("Error");
      const json = await res.json();
      const csv = [
        ["Email", "QCM", "Recruiter", "Status", "QCM Score", "Overall Score", "Duration", "CV", "Date"],
        ...json.items.map(a => [
          a.candidate_email || "", a.qcm_jd_preview || "", a.owner_email || "", a.status,
          a.score || 0, a.overall_score || "", `${Math.floor((a.duration_s || 0) / 60)}min`,
          a.has_cv ? "Yes" : "No", a.started_at ? new Date(a.started_at).toLocaleString() : "",
        ]),
      ].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `candidates_${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert("Error exporting"); }
  }

  if (loading && attempts.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600">Loading...</div></div>;
  }

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <button onClick={exportCSV} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow grid grid-cols-2 md:grid-cols-4 gap-2">
        <input type="text" placeholder="Candidate email" value={filters.email}
          onChange={e => setF("email", e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
        <input type="text" placeholder="Recruiter email" value={filters.owner_email}
          onChange={e => setF("owner_email", e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
        <select value={filters.status} onChange={e => setF("status", e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          <option value="finished">Finished</option>
          <option value="ongoing">In Progress</option>
        </select>
        <div className="flex gap-1">
          <input type="number" placeholder="Min" value={filters.score_min} onChange={e => setF("score_min", e.target.value)}
            className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
          <input type="number" placeholder="Max" value={filters.score_max} onChange={e => setF("score_max", e.target.value)}
            className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      {/* Table - compact */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Overall</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">CV</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attempts.length === 0 ? (
              <tr><td colSpan="7" className="px-3 py-8 text-center text-gray-400">No candidates found</td></tr>
            ) : attempts.map(a => (
              <tr key={a.attempt_id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900 truncate max-w-[180px]">{a.candidate_email || "—"}</div>
                  <div className="text-xs text-gray-400">{a.started_at ? new Date(a.started_at).toLocaleDateString() : ""}</div>
                </td>
                <td className="px-3 py-2 text-gray-500 truncate max-w-[150px]">{a.owner_email || "—"}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${a.status === "finished" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {a.status === "finished" ? "Done" : "..."}
                  </span>
                </td>
                <td className="px-3 py-2 text-center font-medium">{a.score != null ? `${a.score.toFixed(0)}%` : "—"}</td>
                <td className="px-3 py-2 text-center font-medium">{a.overall_score != null ? `${a.overall_score}%` : "—"}</td>
                <td className="px-3 py-2 text-center">{a.has_cv ? <span title="CV uploaded">📄</span> : <span className="text-gray-300">—</span>}</td>
                <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                  <button onClick={() => openDetail(a)} className="text-blue-600 hover:text-blue-900 text-xs font-medium">View</button>
                  <button onClick={() => handleDelete(a.attempt_id)} className="text-red-500 hover:text-red-800 text-xs font-medium">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 text-sm">Previous</button>
          <span className="text-sm text-gray-600">Page {page} / {Math.ceil(total / pageSize)}</span>
          <button onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))} disabled={page >= Math.ceil(total / pageSize)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 text-sm">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <CandidateDetailModal
          attempt={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function CandidateDetailModal({ attempt, loading, onClose }) {
  const full = attempt.full;
  const intake = full?.intake || {};
  const aiReport = intake?.last_ai_report || null;
  const cvMeta = intake?.cv_meta || {};
  const hasCv = !!(cvMeta?.s3_key || cvMeta?.original_name || intake?.cv_file);
  const hasReport = !!aiReport;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{attempt.candidate_email || "Anonymous"}</h2>
            <p className="text-sm text-gray-500">
              {attempt.started_at ? new Date(attempt.started_at).toLocaleString() : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          {loading && !full ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-400">Loading details...</div>
            </div>
          ) : (
            <>
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${attempt.status === "finished" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {attempt.status === "finished" ? "Finished" : "In Progress"}
                </span>
                {hasCv && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">CV Uploaded</span>}
                {hasReport && <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">AI Report</span>}
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-3">
                <ScoreBox label="QCM Score" value={attempt.score != null ? `${attempt.score.toFixed(0)}%` : "—"} />
                <ScoreBox label="Overall Score" value={attempt.overall_score != null ? `${attempt.overall_score}%` : "—"} />
                <ScoreBox label="Duration" value={fmtDuration(attempt.duration_s)} />
              </div>

              {/* Assessment & Recruiter */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Assessment</h3>
                <p className="text-sm text-gray-600">{attempt.qcm_jd_preview || "—"}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Recruiter: <strong>{attempt.owner_email || "—"}</strong></span>
                </div>
              </div>

              {/* Candidate Info from intake */}
              {intake && (Object.keys(intake).length > 0) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Candidate Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {intake.first_name && <InfoRow label="First Name" value={intake.first_name} />}
                    {intake.last_name && <InfoRow label="Last Name" value={intake.last_name} />}
                    {intake.phone && <InfoRow label="Phone" value={intake.phone} />}
                    {intake.location && <InfoRow label="Location" value={intake.location} />}
                    {intake.experience_years != null && <InfoRow label="Experience" value={`${intake.experience_years} years`} />}
                    {intake.availability && <InfoRow label="Availability" value={intake.availability} />}
                    {intake.salary_expectation && <InfoRow label="Salary" value={intake.salary_expectation} />}
                    {intake.notice_period && <InfoRow label="Notice Period" value={intake.notice_period} />}
                  </div>
                </div>
              )}

              {/* CV Info */}
              {hasCv && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-1">
                  <h3 className="text-sm font-semibold text-blue-800">CV</h3>
                  <p className="text-sm text-blue-700">
                    {cvMeta?.original_name || (typeof intake?.cv_file === "object" ? intake.cv_file.original_name : null) || "File uploaded"}
                    {cvMeta?.size_bytes ? ` (${Math.round(cvMeta.size_bytes / 1024)} KB)` : ""}
                  </p>
                </div>
              )}

              {/* AI Report Summary */}
              {hasReport && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-purple-800">AI Report</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {aiReport.cv_fit_score != null && <MiniScore label="CV Fit" val={aiReport.cv_fit_score} />}
                    {aiReport.profile_match_score != null && <MiniScore label="Profile Match" val={aiReport.profile_match_score} />}
                    {aiReport.overall_score != null && <MiniScore label="Overall" val={aiReport.overall_score} />}
                  </div>
                  {aiReport.decision && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Decision:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        aiReport.decision === "proceed" ? "bg-green-100 text-green-700" :
                        aiReport.decision === "hold" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {aiReport.decision}
                      </span>
                    </div>
                  )}
                  {aiReport.summary && (
                    <p className="text-sm text-gray-700 leading-relaxed">{aiReport.summary}</p>
                  )}
                  {aiReport.strengths && aiReport.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
                      <ul className="text-sm text-gray-600 space-y-0.5">
                        {aiReport.strengths.map((s, i) => <li key={i}>+ {s}</li>)}
                      </ul>
                    </div>
                  )}
                  {aiReport.weaknesses && aiReport.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">Weaknesses</p>
                      <ul className="text-sm text-gray-600 space-y-0.5">
                        {aiReport.weaknesses.map((w, i) => <li key={i}>- {w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!hasCv && !hasReport && attempt.status === "finished" && (
                <div className="text-center py-4 text-sm text-gray-400">
                  No CV or AI report available for this candidate.
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-3 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function MiniScore({ label, val }) {
  const color = val >= 70 ? "text-green-700" : val >= 45 ? "text-yellow-700" : "text-red-700";
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{val}%</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function fmtDuration(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}
