"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminQCMs() {
  const [loading, setLoading] = useState(true);
  const [qcms, setQcms] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [filters, setFilters] = useState({
    owner_id: "",
    status: "",
    language: "",
    search: "",
  });

  useEffect(() => {
    loadQCMs();
  }, [page, filters]);

  async function loadQCMs() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filters.owner_id) params.append("owner_id", filters.owner_id);
      if (filters.status) params.append("status", filters.status);
      if (filters.language) params.append("language", filters.language);
      if (filters.search) params.append("search", filters.search);
      
      const res = await fetch(`${BACKEND}/super-admin/qcms?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API ${res.status}`);
      }
      const json = await res.json();
      setQcms(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("[QCMs] Load failed:", err);
      alert(`Erreur lors du chargement des QCMs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(qcmId, newStatus) {
    try {
      const res = await fetch(`${BACKEND}/super-admin/qcms/${qcmId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur");
      loadQCMs();
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  }

  async function handleDelete(qcmId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce QCM ?")) return;
    try {
      const res = await fetch(`${BACKEND}/super-admin/qcms/${qcmId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur");
      loadQCMs();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  if (loading && qcms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Vue Globale des QCMs</h1>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filters.language}
          onChange={(e) => {
            setFilters({ ...filters, language: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Toutes les langues</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <input
          type="text"
          placeholder="Owner ID"
          value={filters.owner_id}
          onChange={(e) => {
            setFilters({ ...filters, owner_id: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QCM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruteur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Langue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux Réussite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Moyen</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {qcms.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Aucun QCM trouvé
                </td>
              </tr>
            ) : (
              qcms.map((qcm) => (
                <tr key={qcm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{qcm.jd_preview || "—"}</div>
                    <div className="text-xs text-gray-500">{qcm.skills_count || 0} compétences</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{qcm.owner_email || "—"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={qcm.status || "draft"}
                      onChange={(e) => handleStatusChange(qcm.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded ${
                        qcm.status === "published" ? "bg-green-100 text-green-800" :
                        qcm.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{qcm.language || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {qcm.attempts_finished ?? 0} / {qcm.attempts_total ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(qcm.pass_rate ?? 0).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(qcm.avg_score ?? 0).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/qcm/${qcm.id}/results`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDelete(qcm.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {page} sur {Math.ceil(total / pageSize)}
          </span>
          <button
            onClick={() => setPage(Math.min(Math.ceil(total / pageSize), page + 1))}
            disabled={page >= Math.ceil(total / pageSize)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

