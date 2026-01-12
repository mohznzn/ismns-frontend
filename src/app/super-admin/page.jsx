"use client";

import { useEffect, useState, useCallback } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("all");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/super-admin/dashboard?period=${period}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("[Dashboard] Load failed:", err);
      alert("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const { metrics, distributions, top_recruiters, top_qcms, openai_tokens } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Recruiters"
          value={metrics.total_recruiters}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Total Assessments"
          value={metrics.total_qcms}
          icon="📝"
          color="green"
        />
        <MetricCard
          title="Total Candidates"
          value={metrics.total_candidates}
          icon="🎯"
          color="purple"
        />
        <MetricCard
          title="Finished Candidates"
          value={metrics.finished_candidates}
          icon="✅"
          color="indigo"
        />
        <MetricCard
          title="Pass Rate"
          value={`${metrics.pass_rate.toFixed(1)}%`}
          icon="📊"
          color="green"
        />
        <MetricCard
          title="Average Score"
          value={`${metrics.avg_score.toFixed(1)}%`}
          icon="⭐"
          color="yellow"
        />
        <MetricCard
          title="Average Duration"
          value={`${Math.floor(metrics.avg_duration / 60)}min`}
          icon="⏱️"
          color="orange"
        />
        <MetricCard
          title="Tokens OpenAI"
          value={openai_tokens.total.toLocaleString()}
          icon="🤖"
          color="pink"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des QCMs par statut */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assessments by Status</h2>
          <div className="space-y-2">
            {Object.entries(distributions.qcms_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(count / metrics.total_qcms) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des scores */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
          <div className="space-y-2">
            {Object.entries(distributions.scores).map(([range, count]) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-gray-700">{range}%</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${metrics.finished_candidates > 0 ? (count / metrics.finished_candidates) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Recruteurs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top 10 Recruiters</h2>
          <div className="space-y-2">
            {top_recruiters.map((recruiter, idx) => (
              <div
                key={recruiter.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">#{idx + 1}</span>
                  <span className="text-sm text-gray-700">{recruiter.email}</span>
                </div>
                <span className="text-sm font-medium">{recruiter.attempts_count} candidates</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 QCMs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top 10 Assessments</h2>
          <div className="space-y-2">
            {top_qcms.map((qcm, idx) => (
              <div
                key={qcm.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 font-bold">#{idx + 1}</span>
                  <span className="text-sm text-gray-700 truncate">{qcm.jd_preview}</span>
                </div>
                <span className="text-sm font-medium ml-2">{qcm.attempts_count} candidates</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
    yellow: "bg-yellow-100 text-yellow-600",
    orange: "bg-orange-100 text-orange-600",
    pink: "bg-pink-100 text-pink-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

