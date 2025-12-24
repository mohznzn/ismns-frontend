// src/app/admin/qcm/page.jsx  (ou src/app/admin/qcm/index.jsx selon ton arbo)
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL; // ex: https://ismns-backend.onrender.com

export default function MyQCMsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all"); // "all" | "draft" | "published"
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return (items || []).filter((q) => {
      const okStatus = status === "all" ? true : (q.status || "").toLowerCase() === status;
      const haystack = `${q.jd_preview || ""} ${q.language || ""} ${q.status || ""}`.toLowerCase();
      const okQuery = haystack.includes((query || "").toLowerCase());
      return okStatus && okQuery;
    });
  }, [items, status, query]);

  const shareUrlFor = (token) =>
    token ? `${window.location.origin}/invite?token=${token}` : "";

  async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
  }

  async function fetchQcms() {
    // Essaye d'abord /admin/qcms (route principale), puis /admin/qcm (alias éventuel)
    const urls = [`${BACKEND}/admin/qcms`, `${BACKEND}/admin/qcm`];
    let last;
    for (const url of urls) {
      const r = await fetch(url, { credentials: "include" });
      if (r.ok) return await r.json();
      const body = await safeJson(r);
      last = { status: r.status, body };
      // si ce n'est PAS un 404, on s'arrête (auth, etc.)
      if (r.status !== 404) break;
    }
    // messages d'erreur plus parlants
    if (last?.status === 401) throw new Error("Not authenticated (401). Connecte-toi d’abord.");
    if (last?.status === 403) throw new Error("Forbidden (403). Ce compte n’a pas accès.");
    throw new Error(last?.body?.error || `API ${last?.status || 500}`);
  }

  const load = async () => {
    if (!BACKEND) {
      setErr("NEXT_PUBLIC_BACKEND_URL is not set");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await fetchQcms();
      setItems(data.items || []);
    } catch (e) {
      setErr(e?.message || "Failed to load QCMs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPublish = async (qcmId) => {
    try {
      const r = await fetch(`${BACKEND}/qcm/${qcmId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await safeJson(r);
      if (!r.ok) throw new Error(data?.error || `Publish failed (${r.status})`);
      alert(`Share link ready:\n${data.share_url}`);
      load();
    } catch (e) {
      alert(e?.message || "Publish failed");
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My QCMs</h1>

      <div className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by job description..."
            className="border rounded-lg px-3 py-2 text-sm w-56"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filtered.length} / {items.length}
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : err ? (
        <div className="text-red-600">Error: {err}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No QCMs yet.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((q) => {
            const shareUrl = shareUrlFor(q.share_token);
            return (
              <div key={q.id} className="bg-white shadow rounded-2xl p-4">
                <div className="grid gap-4 md:grid-cols-[400px_140px_120px_280px] md:items-start">
                  {/* JD preview */}
                  <div className="min-w-0 w-[400px]">
                    <div className="text-sm text-gray-500 mb-1">Job description</div>
                    <div
                      className="font-medium text-gray-900 line-clamp-2"
                      title={q.jd_preview || ""}
                    >
                      {q.jd_preview || "—"}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-sm w-[140px]">
                    <div className="mb-1">
                      <span className="text-gray-500">Language: </span>
                      <span className="font-medium">{q.language}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className="font-medium capitalize">{q.status}</span>
                    </div>
                  </div>

                  <div className="text-sm w-[120px]">
                    <div className="mb-1">
                      <span className="text-gray-500">Skills: </span>
                      <span className="font-medium">{q.skills_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Attempts: </span>
                      <span className="font-medium">{q.attempts_count}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-start gap-2 w-[280px]">
                    <Link
                      href={`/admin/qcm/${q.id}/review`}
                      className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    >
                      Review
                    </Link>
                    <Link
                      href={`/admin/qcm/${q.id}/results`}
                      className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    >
                      Results
                    </Link>

                    {q.status === "draft" ? (
                      <button
                        onClick={() => onPublish(q.id)}
                        className="px-3 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800"
                      >
                        Publish
                      </button>
                    ) : q.share_token ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copy(shareUrl)}
                          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                        >
                          Copy link
                        </button>
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800"
                        >
                          Open link
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
