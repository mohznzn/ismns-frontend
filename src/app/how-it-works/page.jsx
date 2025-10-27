import Section from "@/components/section";

export const metadata = { title: "How it works – ISMNS" };

const steps = [
  { t: "1. Crée ton QCM", d: "Choisis rôle/tech/niveau. L’agent génère un test pertinent." },
  { t: "2. Partage le lien", d: "Un lien unique à publier (LinkedIn, e-mail, etc.)." },
  { t: "3. Le candidat répond", d: "Question par question, timer, sauvegarde." },
  { t: "4. Reçois le rapport", d: "Score, forces/faiblesses, recommandations, export." },
];

export default function HowItWorks() {
  return (
    <Section title="How it works" subtitle="Du prompt au rapport en minutes.">
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="rounded-2xl border p-5 bg-white">
            <div className="font-semibold">{s.t}</div>
            <div className="text-sm opacity-80">{s.d}</div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
