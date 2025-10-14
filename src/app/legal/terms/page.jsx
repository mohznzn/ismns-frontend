// src/app/legal/terms/page.jsx
const sections = [
  {
    title: "1. Objet",
    content:
      "Les présentes conditions encadrent l'utilisation de la plateforme ISMNS et des services associés (génération de QCM, analyse de tentatives, intégrations API).",
  },
  {
    title: "2. Accès au service",
    content:
      "Le client est responsable de la confidentialité de ses identifiants. ISMNS se réserve le droit de suspendre l'accès en cas d'utilisation frauduleuse ou de défaut de paiement.",
  },
  {
    title: "3. Facturation",
    content:
      "Les abonnements sont facturés mensuellement ou annuellement selon le plan choisi. Tout mois entamé est dû. Les factures sont envoyées par email et disponibles depuis l'espace administrateur.",
  },
  {
    title: "4. Données",
    content:
      "Les données clients restent la propriété du client. ISMNS agit en qualité de sous-traitant et applique des mesures de sécurité conformes au RGPD.",
  },
  {
    title: "5. Résiliation",
    content:
      "Chaque partie peut résilier le contrat avec un préavis de 30 jours. Les données sont restituées sur demande dans un format standard.",
  },
];

export const metadata = {
  title: "Conditions d'utilisation | ISMNS",
  description: "Consultez les conditions d'utilisation de la plateforme ISMNS.",
};

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Légal</p>
        <h1 className="text-2xl font-semibold text-gray-900">Conditions d'utilisation</h1>
        <p className="text-xs text-gray-500">Dernière mise à jour : 12 mars 2024</p>
      </section>

      <div className="space-y-4">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl bg-white p-6 shadow space-y-2">
            <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow space-y-2 text-sm text-gray-600">
        <h2 className="text-sm font-semibold text-gray-900">Contact commercial</h2>
        <p>legal@ismns.app — pour toute question contractuelle ou demande d'amendement.</p>
      </section>
    </div>
  );
}
