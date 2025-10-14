// src/app/contact/page.jsx
export const metadata = {
  title: "Contact | ISMNS",
  description: "Discutez avec l'équipe ISMNS pour obtenir une démonstration ou un accompagnement personnalisé.",
};

const offices = [
  {
    city: "Paris",
    address: "38 Rue de la République, 75011 Paris",
    phone: "+33 1 86 26 00 00",
    email: "bonjour@ismns.app",
  },
  {
    city: "Montréal",
    address: "1250 Rue Guy, Montréal, QC H3H 2L3",
    phone: "+1 (514) 555-0182",
    email: "ca@ismns.app",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
        <h1 className="text-2xl font-semibold text-gray-900">Parlons de vos parcours d'évaluation</h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Remplissez le formulaire pour planifier une démonstration, obtenir un devis ou poser vos questions à notre équipe.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Nous écrire</h2>
          <form className="space-y-4 text-sm text-gray-700">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nom complet</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ex. Jeanne Martin"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                required
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email professionnel</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="prenom@entreprise.com"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Entreprise</span>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Nom de votre société"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Message</span>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Parlez-nous de vos besoins en évaluation..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80"
            >
              Envoyer ma demande
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow space-y-3 text-sm text-gray-600">
            <h2 className="text-lg font-semibold text-gray-900">Coordonnées</h2>
            <p>
              Notre équipe répond généralement en moins d'une journée ouvrée. Les clients Enterprise disposent d'un canal Slack dédié.
            </p>
            <div className="space-y-4 text-sm text-gray-700">
              {offices.map((office) => (
                <div key={office.city} className="space-y-1 rounded-xl border border-gray-100 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900">{office.city}</h3>
                  <p>{office.address}</p>
                  <p>{office.phone}</p>
                  <a className="font-semibold text-gray-900 hover:underline" href={`mailto:${office.email}`}>
                    {office.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow space-y-2 text-sm text-gray-600">
            <h2 className="text-lg font-semibold text-gray-900">Besoin d'une assistance immédiate ?</h2>
            <p>
              Consultez notre <a className="font-semibold text-gray-900 hover:underline" href="/support">centre d'aide</a> ou rejoignez le canal Slack dédié si votre organisation y a accès.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
