"use client";

import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminConfig() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [invites, setInvites] = useState([]);
  const [inviteFilter, setInviteFilter] = useState("all");
  const [openaiUsage, setOpenaiUsage] = useState(null);

  useEffect(() => {
    loadConfig();
    loadInvites();
    loadOpenAIUsage();
  }, [inviteFilter]);

  async function loadConfig() {
    try {
      const res = await fetch(`${BACKEND}/super-admin/config`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setConfig(json);
    } catch (err) {
      console.error("[Config] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvites() {
    try {
      const params = new URLSearchParams();
      if (inviteFilter !== "all") params.append("status", inviteFilter);
      
      const res = await fetch(`${BACKEND}/super-admin/invites?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setInvites(json.items || []);
    } catch (err) {
      console.error("[Invites] Load failed:", err);
    }
  }

  async function loadOpenAIUsage() {
    try {
      const res = await fetch(`${BACKEND}/super-admin/openai-usage`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setOpenaiUsage(json);
    } catch (err) {
      console.error("[OpenAI Usage] Load failed:", err);
    }
  }

  async function handleRevokeInvite(inviteId) {
    if (!confirm("Êtes-vous sûr de vouloir révoquer ce lien ?")) return;
    try {
      const res = await fetch(`${BACKEND}/super-admin/invites/${inviteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur");
      loadInvites();
    } catch (err) {
      alert("Erreur lors de la révocation");
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Application</h1>

      {/* Configuration système */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Configuration Système</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Seuil de réussite par défaut:</span>
            <span className="font-medium">{config.pass_threshold}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Durée d'expiration des liens:</span>
            <span className="font-medium">{config.invite_expiration_days} jours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Max candidats par lien:</span>
            <span className="font-medium">{config.max_candidates_per_link === 0 ? "Illimité" : config.max_candidates_per_link}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Durée max des tests:</span>
            <span className="font-medium">{config.max_test_duration_minutes || "Illimité"}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-semibold mb-2">Variables d'environnement (lecture seule)</h3>
          <div className="space-y-1 text-sm">
            {Object.entries(config.environment_variables).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{key}:</span>
                <span className="font-mono text-gray-800">{value || "Non défini"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consommation OpenAI */}
      {openaiUsage && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Consommation OpenAI</h2>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {openaiUsage.total_tokens.toLocaleString()} tokens
              </span>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recruteur</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tokens</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {openaiUsage.by_recruiter.map((recruiter) => (
                  <tr key={recruiter.user_id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{recruiter.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-right">
                      {recruiter.total_tokens.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liens d'invitation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Liens d'Invitation</h2>
          <select
            value={inviteFilter}
            onChange={(e) => setInviteFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
          </select>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QCM</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recruteur</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utilisation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-4 py-2 text-sm font-mono text-gray-900 max-w-xs truncate">
                    {invite.token}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                    {invite.qcm_jd_preview || "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{invite.owner_email || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {invite.used_count} / {invite.max_uses || "∞"}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invite.is_valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {invite.is_valid ? "Valide" : "Invalide"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {invite.is_valid && (
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Révoquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

