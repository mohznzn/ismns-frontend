// src/app/docs/page.jsx
const endpoints = [
  {
    name: "Créer un QCM",
    method: "POST",
    path: "/api/qcm",
    description:
      "Générez un questionnaire à partir d'une fiche de poste, d'un niveau attendu et d'une langue cible.",
  },
  {
    name: "Lister les QCM",
    method: "GET",
    path: "/api/qcm",
    description: "Récupérez la liste paginée des QCM générés pour votre organisation.",
  },
  {
    name: "Publier un QCM",
    method: "POST",
    path: "/api/qcm/{id}/publish",
    description: "Générez un lien sécurisé pour inviter vos candidats à répondre.",
  },
  {
    name: "Consulter les résultats",
    method: "GET",
    path: "/api/results/{attemptId}",
    description: "Accédez au détail des réponses, du score et des indicateurs de confiance.",
  },
];

export const metadata = {
  title: "Documentation API | ISMNS",
  description: "Démarrez avec l'API ISMNS pour automatiser la génération et le suivi de vos QCM.",
};

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">API & intégrations</p>
        <h1 className="text-2xl font-semibold text-gray-900">Documentation API</h1>
        <p className="text-sm text-gray-600 max-w-3xl">
          L'API REST d'ISMNS permet de générer des questionnaires, de gérer les campagnes et de récupérer les résultats pour vos outils internes.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow space-y-3 text-sm text-gray-600">
          <h2 className="text-lg font-semibold text-gray-900">Authentification</h2>
          <p>
            Utilisez des jetons API personnels générés depuis les paramètres d'organisation. Transmettez-les via l'en-tête
            <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">Authorization: Bearer &lt;token&gt;</code>.
          </p>
          <p>Les scopes disponibles permettent de limiter l'accès (lecture seule, gestion des QCM, administration).</p>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow space-y-3 text-sm text-gray-600">
          <h2 className="text-lg font-semibold text-gray-900">SDK & webhooks</h2>
          <p>
            Importez le SDK JavaScript <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">@ismns/sdk</code> pour accéder aux helpers de génération et de scoring.
          </p>
          <p>Configurez des webhooks pour être notifié des événements clés (campagne publiée, tentative complétée, anomalie détectée).</p>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Endpoints principaux</h2>
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="rounded-xl border border-gray-100 p-4 shadow-sm space-y-1">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase">
                <span className="inline-flex items-center rounded-full bg-black px-2 py-0.5 text-white">{endpoint.method}</span>
                <span className="font-mono text-sm text-gray-700">{endpoint.path}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{endpoint.name}</h3>
              <p className="text-sm text-gray-600">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Besoin d'une intégration avancée ?</h2>
        <p className="text-sm text-gray-600">
          Notre équipe solutions peut vous aider à connecter ISMNS à vos outils internes et construire des workflows personnalisés.
        </p>
        <a
          href="mailto:solutions@ismns.app"
          className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80"
        >
          Écrire à l'équipe solutions
        </a>
      </section>
    </div>
  );
}
