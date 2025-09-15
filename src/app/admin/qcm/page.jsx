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
    return items.filter((q) => {
      const okStatus = status === "all" ? true : q.status === status;
      const qtext = `${q.id} ${q.language} ${q.status}`.toLowerCase();
      const okQuery = qtext.includes(query.toLowerCase());
      return okStatus && okQuery;
    });
  }, [items, status, query]);

  const shareUrlFor = (token) =>
    token ? `${window.location.origin}/invite?token=${token}` : "";

  const load = async () => {
    if (!BACKEND) {
      setErr("NEXT_PUBLIC_BACKEND_URL is not set");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/admin/qcms`, {
        credentials: "include", // envoie le cookie 'sid'
      });
      if (!r.ok) throw new Error(`API ${r.status}`);
      const data = await r.json();
      setItems(data.items || []);
      setErr("");
    } catch (e) {
      setErr(e?.message || "Failed to load QCMs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPublish = async (qcmId) => {
    try {
      const r = await fetch(`${BACKEND}/qcm/${qcmId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // indispensable ici aussi si tu relies par cookie
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Publish failed");
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
            placeholder="Search..."
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">QCM</div>
                    <div className="font-semibold break-all">{q.id}</div>
                  </div>

                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Language: </span>
                      <span className="font-medium">{q.language}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className="font-medium capitalize">{q.status}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Skills: </span>
                      <span className="font-medium">{q.skills_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Attempts: </span>
                      <span className="font-medium">{q.attempts_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
