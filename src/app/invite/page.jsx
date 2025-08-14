"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL; // ex: https://ismns-backend.onrender.com

export default function InvitePage() {
  const search = useSearchParams();
  const token = useMemo(() => search.get("token") || "", [search]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [qcm, setQcm] = useState(null); // { qcm: {...}, questions: [...] }
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }

  useEffect(() => {
    if (!token) {
      setErr("Missing invite token.");
      setLoading(false);
      return;
    }
    const url = `${BACKEND}/public/qcm/${encodeURIComponent(token)}`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setQcm(data);
        setErr("");
      })
      .catch((e) => setErr(e.message || "Failed to fetch QCM"))
      .finally(() => setLoading(false));
  }, [token]);

  const onChoose = (qid, oid) => {
    setAnswers((prev) => ({ ...prev, [qid]: oid }));
  };

  const next = () => setIndex((i) => Math.min(i + 1, (qcm?.questions?.length ?? 1) - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const current = qcm?.questions?.[index];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your test…
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">Invite error</h1>
          <p className="text-sm text-red-600">{err}</p>
          <p className="text-sm text-gray-500 mt-2">Check that your link is valid and not expired.</p>
        </div>
      </div>
    );
  }

  if (!qcm) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {!started ? (
          <div className="bg-white shadow rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-2">Welcome to your assessment</h1>
            <p className="text-gray-600 mb-6">
              Language: <span className="font-medium">{qcm.qcm?.language || "en"}</span>
            </p>
            <div className="grid gap-1 text-sm text-gray-600 mb-6">
              <span>• You’ll answer one question at a time.</span>
              <span>• Each question has 4 options — pick exactly one.</span>
              <span>• Explanations are hidden from candidates.</span>
            </div>
            <button
              onClick={() => setStarted(true)}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition"
            >
              Start the test ({qcm.questions?.length || 0} questions)
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-2xl p-6">
            {/* Progress */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Question <span className="font-medium">{index + 1}</span> / {qcm.questions.length}
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${((index + 1) / qcm.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                {current?.skill_tag}
              </div>
              <h2 className="text-lg font-semibold">{current?.text}</h2>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {current?.options?.map((opt) => {
                const checked = answers[current.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition
                      ${checked ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name={current.id}
                      value={opt.id}
                      checked={checked}
                      onChange={() => onChoose(current.id, opt.id)}
                      className="accent-black"
                    />
                    <span className="text-sm">{opt.text}</span>
                  </label>
                );
              })}
            </div>

            {/* Nav */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prev}
                disabled={index === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {index < qcm.questions.length - 1 ? (
                <button
                  onClick={next}
                  disabled={!answers[current.id]}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-40"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => alert("Thanks! Your answers have been recorded locally for MVP.")}
                  disabled={!answers[current.id]}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-40"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
