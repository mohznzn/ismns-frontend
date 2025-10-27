import Section from "@/components/section";

export const metadata = { title: "FAQ – ISMNS" };

const faqs = [
  { q: "QCM multi-langues ?", a: "Oui, prise en charge FR/EN/AR et autres." },
  { q: "API disponible ?", a: "Oui sur le plan Scale (webhooks + endpoints)." },
  { q: "Anti-triche ?", a: "Liens uniques, randomisation, délais et suivi simple." },
  { q: "Exports ?", a: "Rapports PDF et CSV depuis le dashboard." },
];

export default function FaqPage() {
  return (
    <Section title="FAQ">
      <div className="divide-y rounded-2xl border bg-white">
        {faqs.map((f, i) => (
          <div key={i} className="p-5">
            <div className="font-medium">{f.q}</div>
            <div className="mt-1 text-sm opacity-80">{f.a}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
