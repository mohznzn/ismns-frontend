// src/app/pricing/page.jsx
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "49€",
    cadence: "par mois",
    description: "Idéal pour les équipes qui démarrent avec l'évaluation de compétences.",
    highlight: false,
    cta: "Essayer gratuitement",
    features: [
      "Génération de QCM illimitée",
      "10 campagnes actives",
      "Jusqu'à 100 candidats/mois",
      "Exports CSV & PDF",
      "Support email J+1",
    ],
  },
  {
    name: "Scale",
    price: "149€",
    cadence: "par mois",
    description: "Pensé pour les entreprises en croissance qui évaluent plusieurs métiers.",
    highlight: true,
    cta: "Réserver une démo",
    features: [
      "Tout le Starter",
      "Campagnes illimitées",
      "Bibliothèque de questions partagée",
      "Scores comparatifs multi-candidats",
      "Support prioritaire (4h)",
    ],
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    cadence: "",
    description: "Sécurité avancée, intégrations custom et accompagnement dédié.",
    highlight: false,
    cta: "Contacter l'équipe",
    features: [
      "SLA 99,9% & support 24/7",
      "Déploiement On-premise ou VPC dédié",
      "SSO SAML / SCIM",
      "Connecteurs ATS personnalisés",
      "Formations & onboarding dédié",
    ],
  },
];

const faqs = [
  {
    question: "Puis-je tester ISMNS gratuitement ?",
    answer:
      "Oui, vous disposez d'une période d'essai de 14 jours avec toutes les fonctionnalités du plan Starter, sans carte bancaire.",
  },
  {
    question: "Comment se passe la facturation ?",
    answer:
      "La facturation est mensuelle et réalisée en euros. Les clients Enterprise peuvent opter pour une facturation annuelle.",
  },
  {
    question: "Proposez-vous des tarifs pour les écoles ?",
    answer:
      "Oui, contactez-nous pour un devis adapté aux volumes étudiants et aux besoins spécifiques de vos cursus.",
  },
];

export const metadata = {
  title: "Tarifs | ISMNS",
  description: "Comparez les plans ISMNS et choisissez la formule adaptée à votre volume de recrutement.",
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tarifs</p>
        <h1 className="text-2xl font-semibold text-gray-900">Des plans clairs pour chaque étape de votre croissance</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Sans frais cachés. Annulez ou changez de plan quand vous le souhaitez. Réduction de 15% pour un engagement annuel.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl bg-white p-6 shadow space-y-4 border border-gray-100 ${
              plan.highlight ? "ring-2 ring-black" : ""
            }`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{plan.name}</span>
              <div className="text-3xl font-semibold text-gray-900">
                {plan.price}
                {plan.cadence && <span className="text-sm font-normal text-gray-500"> / {plan.cadence}</span>}
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-gray-900" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.highlight ? "/contact" : "/register"}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                plan.highlight
                  ? "bg-black text-white hover:opacity-80"
                  : "border border-gray-300 text-gray-800 hover:border-gray-400"
              }`}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Questions fréquentes</h2>
            <p className="text-sm text-gray-600">
              Une question spécifique ? <Link href="/contact" className="text-gray-900 underline">Contactez-nous</Link>.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400"
          >
            Voir la documentation API
          </Link>
        </div>

        <dl className="grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-gray-100 p-4 shadow-sm space-y-1">
              <dt className="text-sm font-semibold text-gray-900">{faq.question}</dt>
              <dd className="text-sm text-gray-600">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
