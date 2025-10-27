import Section from "@/components/section";

export const metadata = { title: "Changelog – ISMNS" };

const logs = [
  { v:"0.3.0", d:"2025-10-15", items:["Rapport candidat enrichi", "Page Pricing"] },
  { v:"0.2.0", d:"2025-10-10", items:["Dashboard recruteur v1", "Lien unique candidats"] },
];

export default function Changelog() {
  return (
    <Section title="Changelog" subtitle="Ce qui change, et quand.">
      <div className="space-y-4">
        {logs.map((l) => (
          <div key={l.v} className="rounded-2xl border p-5 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">v{l.v}</h3>
              <span className="text-xs opacity-70">{l.d}</span>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm">
              {l.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
