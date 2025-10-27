import Section from "@/components/section";

export const metadata = { title: "Pricing – ISMNS" };

const tiers = [
  { name: "Starter", price: "19€ / mois", points: ["1 recruteur", "100 QCM / mois", "Rapports PDF", "Email support"], cta: "Démarrer" },
  { name: "Team",    price: "49€ / mois", points: ["5 recruteurs", "1 000 QCM / mois", "Priority support", "Branding"], cta: "Choisir Team" },
  { name: "Scale",   price: "Contact",    points: ["SLA", "Illimité*", "SSO & Audit logs", "Webhook & API"], cta: "Contact sales" },
];

export default function PricingPage() {
  return (
    <Section title="Pricing" subtitle="Commence simple, scale quand tu veux.">
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t, i) => (
          <div key={i} className="rounded-2xl border p-6 shadow-sm bg-white">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <div className="text-2xl">{t.price}</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {t.points.map((p, j) => <li key={j}>• {p}</li>)}
            </ul>
            <button className="mt-6 w-full rounded-xl border py-2">{t.cta}</button>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs opacity-80">* usages raisonnables, limites anti-abus.</p>
    </Section>
  );
}
