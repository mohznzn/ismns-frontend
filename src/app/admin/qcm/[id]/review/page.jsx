// src/app/admin/qcm/[id]/review/page.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { admin } from "@/lib/api"; // ← utilise ton api.js centralisé

export default function ReviewQcmPage() {
  const { id } = useParams(); // /admin/qcm/[id]/review
  const [loading, setLoading] = useState(true);
  const [qcm, setQcm] = useState(null);          // { id, language, status, skills, share_token }
  const [questions, setQuestions] = useState([]); // [{ id, skill_tag, text, options[], explanation }]
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await admin.getQcmAdmin(id);
      setQcm(data.qcm || null);
      setQuestions(data.questions || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch QCM");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const title = useMemo(() => {
    if (!qcm) return "Review QCM";
    return `Review QCM • ${qcm.id}`;
  }, [qcm]);

  const onRegenerate = async (qid) => {
    try {
      // UI: spinner local sur la question
      setQuestions((qs) =>
        qs.map((q) => (q.id === qid ? { ...q, __regenLoading: true } : q))
      );
      const res = await admin.regenerateQuestion(id, qid);
      const updated = res?.question;
      if (!updated) throw new Error("No question returned");
      setQuestions((qs) =>
        qs.map((q) => (q.id === qid ? { ...updated } : q))
      );
    } catch (e) {
      alert(e?.message || "Regenerate failed");
      // retire le spinner
      setQuestions((qs) =>
        qs.map((q) => (q.id === qid ? { ...q, __regenLoading: false } : q))
      );
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading…</div>;
  }
  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }
  if (!qcm) {
    return <div className="text-gray-600">QCM not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded-lg border bg-white">
            Language: <span className="font-medium">{qcm.language}</span>
          </span>
          <span className="px-2 py-1 rounded-lg border bg-white">
            Status: <span className="font-medium capitalize">{qcm.status}</span>
          </span>
          <Link
            href="/admin/myqcms"
            className="px-3 py-2 rounded-lg border hover:bg-gray-50"
          >
            Back to list
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-gray-500">No questions in this draft.</div>
      ) : (
        <ol className="space-y-4">
          {questions.map((q, idx) => (
            <li key={q.id} className="bg-white shadow rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="pr-2">
                  <div className="text-sm text-gray-500">
                    Q{idx + 1} • <span className="uppercase">{q.skill_tag}</span>
                  </div>
                  <div className="font-semibold mt-1">{q.text}</div>
                </div>
                <button
                  onClick={() => onRegenerate(q.id)}
                  disabled={q.__regenLoading}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                  title="Regenerate this question"
                >
                  {q.__regenLoading ? "Regenerating…" : "Regenerate"}
                </button>
              </div>

              <ul className="mt-3 grid gap-2">
                {q.options?.map((o) => (
                  <li
                    key={o.id}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      o.is_correct ? "border-green-400 bg-green-50" : ""
                    }`}
                  >
                    {o.text}
                    {o.is_correct && (
                      <span className="ml-2 text-green-600 font-medium">(correct)</span>
                    )}
                  </li>
                ))}
              </ul>

              {q.explanation ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600">
                    Explanation
                  </summary>
                  <p className="mt-2 text-sm text-gray-700">{q.explanation}</p>
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
