import Section from "@/components/section";

export const metadata = { title: "Features – ISMNS" };

export default function FeaturesPage() {
  const features = [
    { t: "Génération QCM multi-langues", d: "Crée des tests par rôle/stack/niveau avec IA." },
    { t: "Lien unique candidat", d: "Partage un lien public, réponses centralisées." },
    { t: "Anti-triche léger", d: "Randomisation, limite de temps et suivi basique." },
    { t: "Rapport clair", d: "Score global, forces/faiblesses, reco, export PDF." },
    { t: "Dashboard recruteur", d: "Vue QCM, invitations, soumissions et filtres." },
  ];
  return (
    <Section title="Features" subtitle="Tout pour évaluer rapidement et proprement.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="rounded-2xl border p-5 shadow-sm bg-white">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm opacity-80">{f.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
