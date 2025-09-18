// src/app/admin/results/page.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function ResultsPage() {
  const [loadingQcms, setLoadingQcms] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [error, setError] = useState("");

  const [qcms, setQcms] = useState([]);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // Filtres / pagination
  const [qcmId, setQcmId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("all");            // all | finished | ongoing
  const [orderBy, setOrderBy] = useState("started_at");   // started_at | finished_at | score
  const [orderDir, setOrderDir] = useState("desc");       // asc | desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Charge la liste des QCMs (pour le select)
  const loadQcms = useCallback(async () => {
    try {
      setLoadingQcms(true);
      setError("");
      const data = await admin.listMyQcms();          // -> credentials: "include"
      setQcms(data.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load QCMs");
    } finally {
      setLoadingQcms(false);
    }
  }, []);

  // Charge les attempts selon les filtres
  const loadAttempts = useCallback(async () => {
    try {
      setLoadingAttempts(true);
      setError("");
      const data = await admin.listAttempts({
        qcm_id: qcmId || undefined,
        email: email || undefined,
        status,
        order_by: orderBy,
        order_dir: orderDir,
        page,
        page_size: pageSize,
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e?.message || "Failed to load results");
    } finally {
      setLoadingAttempts(false);
    }
  }, [qcmId, email, status, orderBy, orderDir, page, pageSize]);

  useEffect(() => {
    loadQcms();
  }, [loadQcms]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Results</h1>

      <div className="bg-white shadow rounded-2xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <select
          value={qcmId}
          onChange={(e) => { setQcmId(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
          disabled={loadingQcms}
        >
          <option value="">All QCMs</option>
          {qcms.map((q) => (
            <option key={q.id} value={q.id}>
              {q.id} ({q.language}) • {q.status}
            </option>
          ))}
        </select>

        <input
          value={email}
          onChange={(e) => { setEmail(e.target.value); setPage(1); }}
          placeholder="Filter by email…"
          className="border rounded-lg px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="finished">Finished</option>
          <option value="ongoing">Ongoing</option>
        </select>

        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="started_at">Order by start</option>
          <option value="finished_at">Order by finish</option>
          <option value="score">Order by score</option>
        </select>

        <select
          value={orderDir}
          onChange={(e) => setOrderDir(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>

      {loadingAttempts ? (
        <div className="text-gray-600">Loading…</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-500">No attempts.</div>
      ) : (
        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-0 border-b bg-gray-50 text-sm font-medium">
            <div className="col-span-3 px-3 py-2">Attempt</div>
            <div className="col-span-3 px-3 py-2">QCM</div>
            <div className="col-span-2 px-3 py-2">Email</div>
            <div className="col-span-1 px-3 py-2 text-right">Score</div>
            <div className="col-span-1 px-3 py-2 text-right">Duration</div>
            <div className="col-span-2 px-3 py-2">Dates</div>
          </div>
          {rows.map((a) => (
            <div
              key={a.attempt_id}
              className="grid grid-cols-12 gap-0 border-b last:border-0 text-sm"
            >
              <div className="col-span-3 px-3 py-3">
                <Link
                  href={`/admin/attempts/${a.attempt_id}`}
                  className="font-medium hover:underline"
                >
                  {a.attempt_id}
                </Link>
              </div>
              <div className="col-span-3 px-3 py-3">
                <div className="font-medium">{a.qcm_id}</div>
                {/* On évite les liens vers des pages non créées pour ne pas générer de 404/_rsc */}
              </div>
              <div className="col-span-2 px-3 py-3">
                {a.candidate_email || <span className="text-gray-400">—</span>}
              </div>
              <div className="col-span-1 px-3 py-3 text-right">
                {a.score ?? 0}%
              </div>
              <div className="col-span-1 px-3 py-3 text-right">
                {a.duration_s ? `${a.duration_s}s` : "—"}
              </div>
              <div className="col-span-2 px-3 py-3 text-xs text-gray-600">
                <div>Start: {a.started_at || "—"}</div>
                <div>Finish: {a.finished_at || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          Page {page} / {totalPages} • {total} items
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 rounded-lg border disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded-lg border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
