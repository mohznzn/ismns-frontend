"use client";

import { useState } from "react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setErr("");

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd);

    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "";
      const res = await fetch(`${base}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "request_failed");
      }
      setOk(true);
      e.currentTarget.reset();
    } catch (e) {
      setErr(e.message || "request_failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-3">
      <input name="name" placeholder="Nom" className="w-full rounded-xl border p-2" required />
      <input name="email" type="email" placeholder="Email" className="w-full rounded-xl border p-2" required />
      <textarea name="message" placeholder="Message" className="w-full rounded-xl border p-2" rows={5} />
      <button disabled={loading} className="rounded-xl border px-4 py-2">
        {loading ? "Envoi..." : "Envoyer"}
      </button>
      {ok && <p className="text-sm text-green-600">Merci ! On revient vers vous.</p>}
      {err && <p className="text-sm text-red-600">Erreur : {err}</p>}
    </form>
  );
}
