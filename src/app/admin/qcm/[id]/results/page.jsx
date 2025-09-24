"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { admin } from "@/lib/api";

export default function QcmResultsPage() {
  const { id } = useParams(); // [id] du QCM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qcm, setQcm] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    async function run() {
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
    }
    run();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results</h1>
        <a
          href={`/admin/qcm/${id}/review`}
          className="text-sm underline hover:opacity-80"
        >
          ← Back to review
        </a>
      </div>

      {qcm && (
        <div className="text-sm text-gray-700">
          <div>QCM: <span className="font-mono">{qcm.id}</span></div>
          <div>Language: <span className="font-semibold">{qcm.language}</span></div>
          <div>Status: <span className="font-semibold">{qcm.status}</span></div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">API error: {error}</div>}
      {loading && <div className="text-sm text-gray-500">Loading…</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Candidate</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Finished</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No attempts yet.
                  </td>
                </tr>
              )}
              {items.map((it) => (
                <tr key={it.attempt_id} className="border-b">
                  <td className="py-2 pr-4">{it.candidate_email || "—"}</td>
                  <td className="py-2 pr-4 capitalize">{it.status}</td>
                  <td className="py-2 pr-4">{it.score}%</td>
                  <td className="py-2 pr-4">
                    {it.started_at ? new Date(it.started_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    {it.finished_at ? new Date(it.finished_at).toLocaleString() : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    {formatDuration(it.duration_s)}
                  </td>
                  <td className="py-2 pr-4">
                    <a
                      href={`/admin/attempt/${it.attempt_id}`}
                      className="underline hover:opacity-80"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDuration(s) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}m ${ss}s`;
}
