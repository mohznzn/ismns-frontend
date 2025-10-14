// src/app/features/page.jsx
import Link from "next/link";

const featureGroups = [
  {
    title: "Génération IA",
    description:
      "Automatisez la création de questionnaires adaptés à chaque fiche de poste grâce à nos pipelines IA supervisés.",
    items: [
      {
        title: "Analyse de fiche de poste",
        text: "Identifiez instantanément les compétences clés et nivelez vos questionnaires en conséquence.",
      },
      {
        title: "Banque de questions assistée",
        text: "Consolidez vos questions favorites et enrichissez-les automatiquement avec des variantes.",
      },
      {
        title: "Scoring intelligent",
        text: "Calibrez la difficulté et pondérez chaque compétence pour obtenir un score exploitable.",
      },
    ],
  },
  {
    title: "Expérience candidat",
    description:
      "Offrez un parcours fluide sur mobile comme sur desktop avec des invitations sécurisées et un suivi en temps réel.",
    items: [
      {
        title: "Invitations personnalisées",
        text: "Envoyez des campagnes branded en quelques clics et planifiez des relances automatiques.",
      },
      {
        title: "Mode triche-safe",
        text: "Activez la surveillance caméra, le suivi d'onglets et la détection d'IA générative.",
      },
      {
        title: "Accessibilité native",
        text: "Respect des standards WCAG 2.1 AA et expérience localisée dans 12 langues.",
      },
    ],
  },
  {
    title: "Pilotage RH",
    description:
      "Centralisez vos campagnes d'évaluation, suivez vos indicateurs et partagez les résultats avec les hiring managers.",
    items: [
      {
        title: "Tableau de bord",
        text: "Visualisez en temps réel l'avancement des campagnes, les taux de complétion et la qualité des réponses.",
      },
      {
        title: "Comparaison collaborative",
        text: "Invitez vos collègues à annoter les questions et consolider les feedbacks sur chaque candidat.",
      },
      {
        title: "Exports & API",
        text: "Synchronisez les résultats vers vos ATS (Lever, Greenhouse, Taleo) ou consommez l'API GraphQL.",
      },
    ],
  },
];

export const metadata = {
  title: "Fonctionnalités | ISMNS",
  description: "Découvrez les fonctionnalités clés de la plateforme ISMNS pour concevoir et piloter vos QCM IA.",
};

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fonctionnalités</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tout ce dont vous avez besoin pour déployer des QCM IA fiables
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl">
            ISMNS combine génération automatique, pilotage RH et expérience candidat premium pour accélérer vos recrutements
            tout en garantissant la justesse de vos évaluations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-full bg-black px-4 py-2 font-medium text-white hover:opacity-80"
          >
            Voir les tarifs
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:border-gray-400"
          >
            Consulter la documentation
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {featureGroups.map((group) => (
          <article key={group.title} className="rounded-2xl bg-white p-6 shadow space-y-4">
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              {group.items.map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-3 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Prêts à moderniser vos évaluations ?</h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Créez votre compte gratuit pour générer vos premiers QCM en moins de 5 minutes et inviter vos candidats en toute sécurité.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-80"
        >
          Démarrer gratuitement
        </Link>
      </section>
    </div>
  );
}
