"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminRecruiters() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  async function loadUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append("search", search);
      
      const res = await fetch(`${BACKEND}/super-admin/users?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setUsers(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error("[Recruiters] Load failed:", err);
      alert("Erreur lors du chargement des recruteurs");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserDetails(userId) {
    try {
      const res = await fetch(`${BACKEND}/super-admin/users/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setSelectedUser(json);
      setShowEditModal(true);
    } catch (err) {
      console.error("[Recruiters] Load details failed:", err);
      alert("Erreur lors du chargement des détails");
    }
  }

  async function handleDelete(userId) {
    try {
      const res = await fetch(`${BACKEND}/super-admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      console.error("[Recruiters] Delete failed:", err);
      alert("Erreur lors de la suppression");
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Recruteurs</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Créer un recruteur
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Rechercher par email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QCMs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens OpenAI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière connexion
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "super_admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {user.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.qcms_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.attempts_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.openai_tokens.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => loadUserDetails(user.id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
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

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={() => handleDelete(selectedUser.id)}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/super-admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, phone_number: phone, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      onSuccess();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Créer un recruteur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSuccess }) {
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone_number || "");
  const [role, setRole] = useState(user.role || "user");
  const [emailVerified, setEmailVerified] = useState(user.email_verified || false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/super-admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, phone_number: phone, role, email_verified: emailVerified }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      onSuccess();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/super-admin/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error("Erreur");
      alert("Mot de passe réinitialisé");
      setShowResetPassword(false);
      setNewPassword("");
    } catch (err) {
      alert("Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <h2 className="text-xl font-bold mb-4">Détails du recruteur</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={emailVerified}
              onChange={(e) => setEmailVerified(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Email vérifié</label>
          </div>

          {/* Réinitialiser le mot de passe */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showResetPassword ? "Annuler" : "Réinitialiser le mot de passe"}
            </button>
            {showResetPassword && (
              <div className="mt-2 space-y-2">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                >
                  Réinitialiser
                </button>
              </div>
            )}
          </div>

          {/* QCMs et Sessions */}
          {user.qcms && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">QCMs ({user.qcms.length})</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {user.qcms.map((qcm) => (
                  <div key={qcm.id} className="text-sm text-gray-600">
                    {qcm.jd_preview} ({qcm.status})
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.sessions && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Sessions récentes ({user.sessions.length})</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {user.sessions.slice(0, 5).map((ses) => (
                  <div key={ses.id} className="text-sm text-gray-600">
                    {new Date(ses.created_at).toLocaleString()} {ses.is_expired ? "(expirée)" : ""}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({ user, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Supprimer le recruteur</h2>
        <p className="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer <strong>{user.email}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

