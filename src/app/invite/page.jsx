// src/app/invite/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL; // ex: https://ismns-backend.onrender.com

export default function InvitePage() {
  const router = useRouter();
  const search = useSearchParams();
  const token = useMemo(() => search.get("token") || "", [search]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // données publiques de l'épreuve
  const [qcmMeta, setQcmMeta] = useState(null); // { id, language }
  const [questions, setQuestions] = useState([]); // liste de questions (publique)
  // tentative côté candidat
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState(null); // {score, correct_count, total_questions, duration_s, passed?}

  // Charge l'épreuve publique via le token
  useEffect(() => {
    if (!token) {
      setErr("Missing invite token.");
      setLoading(false);
      return;
    }
    
    (async () => {
      try {
        const url = `${BACKEND}/public/qcm/${encodeURIComponent(token)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`API ${r.status}`);
        const data = await r.json(); // { qcm: {...}, questions: [...] }
        setQcmMeta(data.qcm || null);
        setQuestions(data.questions || []);
        setErr("");
      } catch (e) {
        setErr(e.message || "Failed to fetch QCM");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // helpers UI
  const next = () => setIndex((i) => Math.min(i + 1, Math.max(0, questions.length - 1)));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const current = questions[index];

  // sélection d’une option → enregistrement immédiat côté backend si la tentative est démarrée
  const onChoose = async (qid, oid) => {
    setAnswers((prev) => ({ ...prev, [qid]: oid }));
    if (!attemptId) return; // si l’utilisateur coche avant le start (devrait pas arriver), on ignore
    try {
      const res = await fetch(`${BACKEND}/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: qid, option_id: oid }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
    } catch (e) {
      alert(`Save failed:\n${e.message}`);
    }
  };

  // démarre la tentative
  const onStart = async () => {
    if (!firstName.trim()) { alert("First name is required."); return; }
    if (!lastName.trim()) { alert("Last name is required."); return; }
    if (!email.trim()) { alert("Email is required."); return; }
    if (!phone.trim()) { alert("Phone number is required."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { alert("Please enter a valid email address."); return; }
    
    try {
      setLoading(true);
      
      const res = await fetch(`${BACKEND}/attempts/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          candidate_email: email.trim(),
          candidate_first_name: firstName.trim(),
          candidate_last_name: lastName.trim(),
          candidate_phone: phone.trim(),
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

      // Le backend renvoie attempt_id + (optionnellement) qcm/questions "gelés" pour la tentative
      if (data?.questions?.length) {
        setQuestions(data.questions);
      }
      setAttemptId(data.attempt_id);
      setStarted(true);
      setIndex(0);
      setAnswers({});
    } catch (e) {
      alert(`Unable to start test:\n${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // termine la tentative
  const onFinish = async () => {
    if (!attemptId) return;
    try {
      setFinishing(true);
      const res = await fetch(`${BACKEND}/attempts/${attemptId}/finish`, {
        method: "POST",
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);

      if (data?.passed) {
        const params = new URLSearchParams({
          attempt_id: attemptId,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          lang: data.language || qcmMeta?.language || "en",
        });
        router.replace(`/intake?${params.toString()}`);
        return;
      }

      // sinon on reste sur l'écran de score "merci"
      setResult(data);
    } catch (e) {
      alert(`Finish failed:\n${e.message}`);
    } finally {
      setFinishing(false);
    }
  };

  // ====== ÉTATS D’AFFICHAGE ======
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
          <p className="text-sm text-gray-500 mt-2">
            Check that your link is valid and not expired.
          </p>
        </div>
      </div>
    );
  }

  if (!qcmMeta) return null;

  // Écran final (après finish) — montré uniquement si "passed" est false/absent
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <div className="bg-white shadow rounded-2xl p-6 space-y-4">
            <h1 className="text-2xl font-bold">Your score</h1>
            <div className="text-5xl font-extrabold">{result.score}%</div>
            <div className="text-gray-600">
              {result.correct_count} correct / {result.total_questions} questions
            </div>
            <div className="text-sm text-gray-500">
              Duration: {result.duration_s}s
            </div>
            <p className="text-sm text-gray-500">
              Thank you! We’ll get back to you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Écran d’accueil (avant start)
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <div className="bg-white shadow rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-2">Welcome to your assessment</h1>
            <p className="text-gray-600 mb-6">
              Language: <span className="font-medium">{qcmMeta.language || "en"}</span>
            </p>

            <div className="grid gap-1 text-sm text-gray-600 mb-6">
              <span>• You'll answer one question at a time.</span>
              <span>• Each question has 4 options — pick exactly one.</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setFirstName((v) => v.trim().replace(/\b\w/g, c => c.toUpperCase()))}
                    placeholder="John"
                    required
                    style={{ textTransform: "capitalize" }}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setLastName((v) => v.trim().toUpperCase())}
                    placeholder="DOE"
                    required
                    style={{ textTransform: "uppercase" }}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  required
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
                />
              </div>
            </div>

            <button
              onClick={onStart}
              disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start the test ({questions.length || 0} questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran du test (après start, avant finish)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-white shadow rounded-2xl p-6">
          {/* Progress */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Question <span className="font-medium">{index + 1}</span> / {questions.length}
            </div>
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black"
                style={{ 
                  width: questions.length > 0 && index >= 0 
                    ? `${Math.max(0, Math.min(100, ((index + 1) / questions.length) * 100))}%` 
                    : "0%" 
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

            {index < questions.length - 1 ? (
              <button
                onClick={next}
                disabled={!answers[current.id]}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onFinish}
                disabled={!answers[current.id] || finishing}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-40"
              >
                {finishing ? "Finishing…" : "Finish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
