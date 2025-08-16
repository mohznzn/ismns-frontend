"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminAttemptDetailPage() {
  const params = useParams();
  const attemptId = useMemo(() => {
    const v = params?.attemptId;
    return Array.isArray(v) ? v[0] : v || "";
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [qcm, setQcm] = useState(null);
  const [questions, setQuestions] = useState([]); // admin view: with is_correct, explanation
  const [answers, setAnswers] = useState({}); // fallback mapping if provided separately

  useEffect(() => {
    if (!attemptId) {
      setErr("Missing attemptId.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // Endpoint admin détaillé
        const r = await fetch(`${BACKEND}/admin/attempts/${encodeURIComponent(attemptId)}`);
        const text = await r.text();
        const data = text ? JSON.parse(text) : null;
        if (!r.ok) throw new Error(data?.message || data?.error || `HTTP ${r.status}`);

        setAttempt(data?.attempt || null);
        setQcm(data?.qcm || null);

        // Plusieurs schémas possibles côté backend :
        // 1) questions: [{id, text, skill_tag, options: [{id,text,is_correct}], selected_option_id, is_correct, explanation}]
        // 2) questions + answers { [qid]: optionId }
        const qs = Array.isArray(data?.questions) ? data.questions : [];
        setQuestions(qs);
        setAnswers(data?.answers || {});
        setErr("");
      } catch (e) {
        setErr(e.message || "Failed to load attempt detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading attempt…
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Attempt error</h1>
          <p className="text-sm text-red-600">{err}</p>
        </div>
      </div>
    );
  }

  const qcmId = qcm?.id || attempt?.qcm_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Attempt details</h1>
              <div className="text-gray-600 mt-1">
                Candidate:{" "}
                <span className="font-medium">
                  {attempt?.candidate_name ||
                    attempt?.candidate_email ||
                    attempt?.email ||
                    "Anonymous"}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2 space-x-2">
                {attempt?.started_at ? <span>Started: {attempt.started_at}</span> : null}
                {attempt?.finished_at ? <span>• Finished: {attempt.finished_at}</span> : null}
                {typeof attempt?.duration_s === "number" ? (
                  <span>• Duration: {attempt.duration_s}s</span>
                ) : null}
                {qcm?.language ? <span>• Lang: {qcm.language}</span> : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {qcmId ? (
                <Link
                  href={`/admin/qcm/${encodeURIComponent(qcmId)}/results`}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Back to results
                </Link>
              ) : null}
            </div>
          </div>

          {/* Score */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-3xl font-bold">
                {attempt?.score_pct ?? attempt?.score ?? 0}%
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Correct</div>
              <div className="text-3xl font-bold">
                {attempt?.correct_count ?? 0}/{attempt?.total_questions ?? questions.length ?? 0}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Questions</div>
              <div className="text-3xl font-bold">{questions.length}</div>
            </div>
          </div>
        </div>

        {/* Questions detail */}
        <div className="bg-white shadow rounded-2xl p-2">
          {questions.length === 0 ? (
            <div className="p-6 text-gray-600">No questions found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {questions.map((q) => {
                const selected =
                  q.selected_option_id || answers[q.id] || null;
                const correctOpt = (q.options || []).find((o) => o.is_correct);
                const isCorrect =
                  typeof q.is_correct === "boolean"
                    ? q.is_correct
                    : selected && correctOpt
                    ? selected === correctOpt.id
                    : false;

                return (
                  <li key={q.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          {q.skill_tag}
                        </div>
                        <h2 className="text-base font-semibold">{q.text}</h2>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mt-4 space-y-2">
                      {(q.options || []).map((o) => {
                        const picked = selected === o.id;
                        const isRight = !!o.is_correct;
                        const base =
                          "flex items-center gap-3 border rounded-xl p-3";
                        let cls = "border-gray-200";
                        if (isRight && picked) cls = "border-green-600 bg-green-50";
                        else if (isRight) cls = "border-green-400 bg-green-50/40";
                        else if (picked) cls = "border-red-500 bg-red-50";
                        return (
                          <div key={o.id} className={`${base} ${cls}`}>
                            <span className="text-sm">{o.text}</span>
                            {picked && (
                              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-black text-white">
                                Selected
                              </span>
                            )}
                            {isRight && (
                              <span className="ml-2 text-xs px-2 py-1 rounded-full border border-green-600 text-green-700">
                                Correct answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation (admin-only) */}
                    {q.explanation ? (
                      <div className="mt-4 text-sm text-gray-600">
                        <span className="font-medium">Explanation:</span>{" "}
                        {q.explanation}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
