"use client";
import Section from "@/components/section";
import { useState } from "react";

export const metadata = { title: "Contact – ISMNS" };

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL) + "/api/contact",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) }
    );
    setOk(res.ok); setLoading(false);
  }

  return (
    <Section title="Contact sales" subtitle="Parlons de vos besoins.">
      <form onSubmit={onSubmit} className="max-w-xl space-y-3">
        <input name="name" placeholder="Nom" className="w-full rounded-xl border p-2" required />
        <input name="email" type="email" placeholder="Email" className="w-full rounded-xl border p-2" required />
        <textarea name="message" placeholder="Message" className="w-full rounded-xl border p-2" rows={5} />
        <button disabled={loading} className="rounded-xl border px-4 py-2">
          {loading ? "Envoi..." : "Envoyer"}
        </button>
        {ok && <p className="text-sm text-green-600">Merci ! On revient vers vous.</p>}
      </form>
    </Section>
  );
}
