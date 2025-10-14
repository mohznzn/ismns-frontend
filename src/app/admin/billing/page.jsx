// src/app/admin/billing/page.jsx
const invoices = [
  { id: "INV-2301", date: "02/04/2024", amount: "149,00 €", status: "Payée" },
  { id: "INV-2290", date: "04/03/2024", amount: "149,00 €", status: "Payée" },
  { id: "INV-2278", date: "05/02/2024", amount: "149,00 €", status: "Payée" },
];

export const metadata = {
  title: "Facturation | ISMNS",
};

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Facturation</h1>
        <p className="text-sm text-gray-600">
          Consultez votre abonnement, mettez à jour vos informations de paiement et récupérez vos factures.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Plan actuel</h2>
              <p className="text-sm text-gray-600">Scale — facturation mensuelle</p>
            </div>
            <button className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
              Changer de plan
            </button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            14 licences collaborateurs incluses. Besoin de plus ? Contactez{' '}
            <a className="font-semibold text-gray-900 hover:underline" href="mailto:finance@ismns.app">
              finance@ismns.app
            </a>
            .
          </div>
          <dl className="grid gap-4 sm:grid-cols-3 text-sm text-gray-600">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Prochaine facturation</dt>
              <dd className="text-sm font-semibold text-gray-900">02 mai 2024</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Montant</dt>
              <dd className="text-sm font-semibold text-gray-900">149,00 €</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">Moyen de paiement</dt>
              <dd className="text-sm font-semibold text-gray-900">Visa •••• 4242</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Mode de paiement</h2>
          <p className="text-sm text-gray-600">
            Les paiements sont sécurisés via Stripe. Mettez à jour votre carte pour éviter toute interruption de service.
          </p>
          <button className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80">
            Mettre à jour la carte
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Historique des factures</h2>
          <button className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
            Télécharger tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-3 pr-8">Référence</th>
                <th className="py-3 pr-8">Date</th>
                <th className="py-3 pr-8">Montant</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3 text-right">Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="py-3 pr-8 font-semibold text-gray-900">{invoice.id}</td>
                  <td className="py-3 pr-8">{invoice.date}</td>
                  <td className="py-3 pr-8">{invoice.amount}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex rounded-full bg-gray-900 px-3 py-0.5 text-xs font-semibold text-white">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm font-semibold text-gray-900 underline">Télécharger</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
