// src/app/support/page.jsx
import Link from "next/link";

const categories = [
  {
    title: "Prise en main",
    description: "Configurez votre compte, invitez votre équipe et lancez vos premières campagnes.",
    articles: [
      "Créer un QCM à partir d'une fiche de poste",
      "Inviter un candidat et planifier des relances",
      "Comprendre les rôles et permissions",
    ],
  },
  {
    title: "Pilotage",
    description: "Analysez vos campagnes, exportez les résultats et synchronisez avec votre ATS.",
    articles: [
      "Tableau de bord: lecture des indicateurs",
      "Exporter les résultats vers Greenhouse",
      "Activer l'intégration Slack",
    ],
  },
  {
    title: "Sécurité & conformité",
    description: "Assurez la conformité RGPD et garantissez l'intégrité des évaluations.",
    articles: [
      "Activer le mode anti-triche",
      "Gérer les demandes d'accès candidat",
      "Politique de conservation des données",
    ],
  },
];

const contactChannels = [
  {
    title: "Email",
    detail: "support@ismns.app",
    description: "Réponse sous 1 jour ouvré pour les plans Starter, 4h pour les plans Scale et Enterprise.",
  },
  {
    title: "Chat en direct",
    detail: "Disponible du lundi au vendredi, 9h-18h CET",
    description: "Prenez rendez-vous pour un partage d'écran avec un spécialiste produit.",
  },
  {
    title: "Centre de statut",
    detail: "status.ismns.app",
    description: "Consultez la disponibilité en temps réel et abonnez-vous aux notifications incident.",
  },
];

export const metadata = {
  title: "Support | ISMNS",
  description: "Accédez aux guides d'utilisation, FAQ et canaux d'assistance de la plateforme ISMNS.",
};

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Support client</p>
        <h1 className="text-2xl font-semibold text-gray-900">Nous sommes là pour vous aider</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          Retrouvez les guides détaillés, les bonnes pratiques et contactez notre équipe pour accélérer le déploiement de vos évaluations.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="#knowledge-base"
            className="inline-flex items-center rounded-full bg-black px-4 py-2 font-semibold text-white hover:opacity-80"
          >
            Accéder au centre d'aide
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:border-gray-400"
          >
            Contacter le support
          </Link>
        </div>
      </section>

      <section id="knowledge-base" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Base de connaissances</h2>
          <Link href="/docs" className="text-sm font-semibold text-gray-900 underline">
            Voir aussi la documentation API
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <article key={category.title} className="rounded-2xl bg-white p-6 shadow space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {category.articles.map((article) => (
                  <li key={article} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900" aria-hidden />
                    <span>{article}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="text-sm font-semibold text-gray-900 underline">
                Besoin d'aide sur ce sujet ?
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Canaux d'assistance</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {contactChannels.map((channel) => (
            <div key={channel.title} className="rounded-xl border border-gray-100 p-4 shadow-sm space-y-1 text-sm text-gray-700">
              <h3 className="text-sm font-semibold text-gray-900">{channel.title}</h3>
              <p className="font-semibold text-gray-900">{channel.detail}</p>
              <p className="text-gray-600">{channel.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
