"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminCandidates() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [filters, setFilters] = useState({
    owner_id: "",
    qcm_id: "",
    email: "",
    status: "",
    score_min: "",
    score_max: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    loadAttempts();
  }, [page, filters]);

  async function loadAttempts() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`${BACKEND}/super-admin/attempts?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setAttempts(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("[Candidates] Load failed:", err);
      alert("Error loading candidates");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(attemptId) {
    if (!confirm("Are you sure you want to delete this attempt?")) return;
    try {
      const res = await fetch(`${BACKEND}/super-admin/attempts/${attemptId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur");
      loadAttempts();
    } catch (err) {
      alert("Error deleting");
    }
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`${BACKEND}/super-admin/attempts?${params}&page_size=10000`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      
      const csv = [
        ["Email", "QCM", "Recruteur", "Statut", "Score QCM", "Overall Score", "Durée", "Date"],
        ...json.items.map((a) => [
          a.candidate_email || "",
          a.qcm_jd_preview || "",
          a.owner_email || "",
          a.status,
          a.score || 0,
          a.overall_score || "",
          `${Math.floor((a.duration_s || 0) / 60)}min`,
          a.started_at ? new Date(a.started_at).toLocaleString() : "",
        ]),
      ]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `candidates_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error exporting");
    }
  }

  if (loading && attempts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Global Candidates View</h1>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Candidate email"
          value={filters.email}
          onChange={(e) => {
            setFilters({ ...filters, email: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All statuses</option>
          <option value="finished">Finished</option>
          <option value="ongoing">In Progress</option>
        </select>
        <input
          type="number"
          placeholder="Min score"
          value={filters.score_min}
          onChange={(e) => {
            setFilters({ ...filters, score_min: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="number"
          placeholder="Max score"
          value={filters.score_max}
          onChange={(e) => {
            setFilters({ ...filters, score_max: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="Owner ID"
          value={filters.owner_id}
          onChange={(e) => {
            setFilters({ ...filters, owner_id: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="QCM ID"
          value={filters.qcm_id}
          onChange={(e) => {
            setFilters({ ...filters, qcm_id: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          placeholder="Date début"
          value={filters.date_from}
          onChange={(e) => {
            setFilters({ ...filters, date_from: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="date"
          placeholder="Date fin"
          value={filters.date_to}
          onChange={(e) => {
            setFilters({ ...filters, date_to: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QCM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QCM Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attempts.map((attempt) => (
              <tr key={attempt.attempt_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{attempt.candidate_email || "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {attempt.qcm_jd_preview || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{attempt.owner_email || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    attempt.status === "finished" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {attempt.status === "finished" ? "Finished" : "In Progress"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{attempt.score.toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {attempt.overall_score !== null ? `${attempt.overall_score}%` : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {(() => {
                    const duration = attempt.duration_s || 0;
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    if (minutes > 0) {
                      return `${minutes}min ${seconds}s`;
                    }
                    return `${seconds}s`;
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {attempt.started_at ? new Date(attempt.started_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/attempt/${attempt.attempt_id}/report`}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(attempt.attempt_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / pageSize)}
          </span>
          <button
            onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

