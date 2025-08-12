"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function ReviewPage() {
  const { id } = useParams();
  const [qcm, setQcm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND}/qcm/${id}/admin`);
        if (!res.ok) throw new Error("Failed to fetch QCM");
        const data = await res.json();
        setQcm(data.qcm);
        setQuestions(data.questions);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const publish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${BACKEND}/qcm/${id}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Publish failed");
      const data = await res.json();
      setShareUrl(data.share_url);
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  if (!id) return null;
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Review QCM</h1>
      <p>
        <b>Language:</b> {qcm?.language}
      </p>
      <p>
        <b>Status:</b> {qcm?.status}
      </p>

      <h2>Questions</h2>
      {questions.map((q, idx) => (
        <div
          key={q.id}
          style={{ padding: 16, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}
        >
          <div>
            <b>
              Q{idx + 1} ({q.skill_tag})
            </b>
          </div>
          <div style={{ margin: "8px 0" }}>{q.text}</div>
          <ol type="A">
            {q.options.map((o) => (
              <li key={o.id}>
                {o.text} {o.is_correct ? " ✅ (correct - admin only)" : ""}
              </li>
            ))}
          </ol>
          <details>
            <summary>Explanation (admin only)</summary>
            <p>{q.explanation}</p>
          </details>
        </div>
      ))}

      <button onClick={publish} disabled={publishing || shareUrl !== null}>
        {publishing ? "Publishing..." : "Publish & get share link"}
      </button>

      {shareUrl && (
        <div style={{ marginTop: 16 }}>
          <b>Share URL:</b>
          <div>
            <a href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
