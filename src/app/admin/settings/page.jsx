// src/app/admin/settings/page.jsx
const members = [
  { name: "Jeanne Martin", role: "Admin", email: "jeanne@acme.co" },
  { name: "Romain Dubois", role: "Manager", email: "romain@acme.co" },
  { name: "Fatou Ndiaye", role: "Reviewer", email: "fatou@acme.co" },
];

const apiKeys = [
  { name: "Backend hiring", createdAt: "12/03/2024", lastUsed: "10/04/2024", scope: "full-access" },
  { name: "Data warehouse", createdAt: "02/02/2024", lastUsed: "05/04/2024", scope: "read-only" },
];

export const metadata = {
  title: "Paramètres | ISMNS",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Paramètres de l'organisation</h1>
        <p className="text-sm text-gray-600">
          Gérez votre profil, vos préférences linguistiques et les autorisations de votre équipe.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <div className="rounded-2xl bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <form className="space-y-4 text-sm text-gray-700">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prénom</span>
                <input
                  type="text"
                  defaultValue="Jeanne"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nom</span>
                <input
                  type="text"
                  defaultValue="Martin"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Langue par défaut</span>
              <select className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-black focus:outline-none" defaultValue="fr">
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-black" />
              <span>Recevoir un résumé hebdomadaire des campagnes</span>
            </label>
            <div className="flex justify-end">
              <button className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80">
                Enregistrer
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow space-y-3 text-sm text-gray-600">
          <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          <p>Authentification à deux facteurs activée via application mobile.</p>
          <p>Dernière connexion : 10 avril 2024 — 09:42 (Paris).</p>
          <button className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
            Révoquer les sessions actives
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Membres de l'équipe</h2>
          <button className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-80">
            Inviter un membre
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-3 pr-6">Nom</th>
                <th className="py-3 pr-6">Email</th>
                <th className="py-3 pr-4">Rôle</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {members.map((member) => (
                <tr key={member.email}>
                  <td className="py-3 pr-6 font-semibold text-gray-900">{member.name}</td>
                  <td className="py-3 pr-6">{member.email}</td>
                  <td className="py-3 pr-4">{member.role}</td>
                  <td className="py-3 text-right">
                    <button className="text-sm font-semibold text-gray-900 underline">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Clés API</h2>
          <button className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
            Générer une nouvelle clé
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {apiKeys.map((key) => (
            <div key={key.name} className="rounded-xl border border-gray-100 p-4 shadow-sm text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">{key.name}</p>
              <p>Créée le {key.createdAt} — Dernier usage {key.lastUsed}</p>
              <p>Scope : <span className="font-semibold text-gray-900">{key.scope}</span></p>
              <button className="text-sm font-semibold text-gray-900 underline">Révoquer</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
