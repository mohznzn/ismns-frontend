// src/app/legal/privacy/page.jsx
const sections = [
  {
    title: "1. Responsable du traitement",
    content:
      "ISMNS, société par actions simplifiée au capital de 120 000€, immatriculée au RCS de Paris sous le numéro 902 123 456, est responsable du traitement des données collectées via la plateforme.",
  },
  {
    title: "2. Données collectées",
    content:
      "Nous collectons les informations nécessaires à la gestion de votre compte (identité, coordonnées professionnelles, préférences linguistiques), ainsi que les réponses aux questionnaires transmises par vos candidats.",
  },
  {
    title: "3. Finalités",
    content:
      "Les données sont utilisées pour fournir le service, améliorer nos algorithmes de génération, assurer la sécurité de la plateforme et respecter nos obligations légales.",
  },
  {
    title: "4. Conservation",
    content:
      "Les comptes inactifs sont supprimés après 24 mois. Les tentatives candidates peuvent être anonymisées après 12 mois sur demande de votre organisation.",
  },
  {
    title: "5. Droits",
    content:
      "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité. Contactez privacy@ismns.app pour exercer vos droits.",
  },
];

export const metadata = {
  title: "Politique de confidentialité | ISMNS",
  description: "Découvrez comment ISMNS collecte, traite et protège vos données et celles de vos candidats.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Légal</p>
        <h1 className="text-2xl font-semibold text-gray-900">Politique de confidentialité</h1>
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
        <h2 className="text-sm font-semibold text-gray-900">Contact délégué à la protection des données</h2>
        <p>privacy@ismns.app — 38 Rue de la République, 75011 Paris. Nous répondons sous 30 jours maximum.</p>
      </section>
    </div>
  );
}
