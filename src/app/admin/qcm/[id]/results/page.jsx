// src/app/admin/qcm/[id]/results/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api";

export default function QcmResultsPage() {
  const { id } = useParams(); // [id] du QCM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qcm, setQcm] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | finished | ongoing

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || []).filter((it) => {
      const txt = `${it.candidate_email || ""} ${it.status || ""}`.toLowerCase();
      const okQuery = q ? txt.includes(q) : true;
      const okStatus =
        status === "all" ? true : (it.status || "") === status;
      return okQuery && okStatus;
    });
  }, [items, query, status]);

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
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <div className="text-gray-500">QCM</div>
              <div className="font-mono break-all">{qcm.id}</div>
            </div>
            <div>
              <div className="text-gray-500">Language</div>
              <div className="font-semibold">{qcm.language}</div>
            </div>
            <div>
              <div className="text-gray-500">Status</div>
              <StatusBadge value={qcm.status} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Loading QCM…</div>
        )}
      </div>

      {/* Tools / Filters */}
      <div className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="finished">Finished</option>
            <option value="ongoing">Ongoing</option>
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
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No attempts yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.attempt_id} className="border-b">
                      <Td>{it.candidate_email || "—"}</Td>
                      <Td>
                        <StatusBadge value={it.status} />
                      </Td>
                      <Td>{isNil(it.score) ? "—" : `${it.score}%`}</Td>
                      <Td>{formatDate(it.started_at)}</Td>
                      <Td>{formatDate(it.finished_at)}</Td>
                      <Td>{formatDuration(it.duration_s)}</Td>
                      <Td>
                        <Link
                          href={`/admin/attempt/${it.attempt_id}`}
                          className="underline hover:opacity-80"
                          prefetch={false}
                        >
                          View
                        </Link>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────── helpers UI ───────────────── */

function Th({ children }) {
  return <th className="py-2 px-4 font-medium text-gray-700">{children}</th>;
}
function Td({ children }) {
  return <td className="py-2 px-4">{children}</td>;
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

function downloadCsv(rows) {
  const header = [
    "attempt_id",
    "candidate_email",
    "status",
    "score",
    "started_at",
    "finished_at",
    "duration_s",
  ];
  const lines = [
    toCsvRow(header),
    ...rows.map((r) =>
      toCsvRow([
        r.attempt_id,
        r.candidate_email || "",
        r.status || "",
        isNil(r.score) ? "" : r.score,
        r.started_at || "",
        r.finished_at || "",
        isNil(r.duration_s) ? "" : r.duration_s,
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
