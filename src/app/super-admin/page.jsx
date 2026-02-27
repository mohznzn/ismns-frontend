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
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const { metrics, distributions, top_recruiters, top_qcms, openai_tokens, evolution, recent_activity } = data;
  const completionRate = metrics.total_candidates > 0
    ? ((metrics.finished_candidates / metrics.total_candidates) * 100).toFixed(1)
    : "0.0";

  const evoMax = Math.max(1, ...((evolution || []).map(e => e.count)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <div className="flex items-center gap-3">
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
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Recruiters" value={metrics.total_recruiters} icon="👥" color="blue" />
        <MetricCard title="Assessments" value={metrics.total_qcms} icon="📝" color="green" />
        <MetricCard title="Candidates" value={metrics.total_candidates} icon="🎯" color="purple" />
        <MetricCard title="Finished" value={metrics.finished_candidates} icon="✅" color="indigo" />
        <MetricCard title="Completion" value={`${completionRate}%`} icon="📈" color="cyan" />
        <MetricCard title="Pass Rate" value={`${metrics.pass_rate.toFixed(1)}%`} icon="📊" color="green" />
        <MetricCard title="Avg Score" value={`${metrics.avg_score.toFixed(1)}%`} icon="⭐" color="yellow" />
        <MetricCard title="Avg Duration" value={`${Math.floor(metrics.avg_duration / 60)}min`} icon="⏱️" color="orange" />
        <MetricCard title="OpenAI Tokens" value={openai_tokens.total.toLocaleString()} icon="🤖" color="pink" />
      </div>

      {/* Evolution Chart */}
      {evolution && evolution.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Candidates Over Last 30 Days</h2>
          <div className="flex items-end gap-[2px] h-40">
            {evolution.map((day, i) => {
              const height = evoMax > 0 ? (day.count / evoMax) * 100 : 0;
              const dateObj = new Date(day.date);
              const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(height, 1.5)}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                    {label}: {day.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{new Date(evolution[0]?.date).toLocaleDateString()}</span>
            <span>{new Date(evolution[evolution.length - 1]?.date).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assessments by Status</h2>
          <div className="space-y-3">
            {Object.entries(distributions.qcms_by_status).length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : Object.entries(distributions.qcms_by_status).map(([status, count]) => {
              const pct = metrics.total_qcms > 0 ? (count / metrics.total_qcms) * 100 : 0;
              const statusColor = status === "published" ? "bg-green-500" : status === "draft" ? "bg-yellow-500" : "bg-gray-400";
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize w-24">{status}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div className={`${statusColor} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
          <div className="space-y-3">
            {Object.entries(distributions.scores).map(([range, count]) => {
              const pct = metrics.finished_candidates > 0 ? (count / metrics.finished_candidates) * 100 : 0;
              return (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-gray-700 w-20">{range}%</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recent_activity && recent_activity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recent_activity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <span className="text-lg mt-0.5">{activityIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{item.message}</p>
                  <p className="text-xs text-gray-400">{timeAgo(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top 10 Recruiters</h2>
          {top_recruiters.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {top_recruiters.map((recruiter, idx) => (
                <div key={recruiter.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold w-6">#{idx + 1}</span>
                    <span className="text-sm text-gray-700">{recruiter.email}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{recruiter.attempts_count} candidates</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top 10 Assessments</h2>
          {top_qcms.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {top_qcms.map((qcm, idx) => (
                <div key={qcm.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-gray-400 font-bold w-6">#{idx + 1}</span>
                    <span className="text-sm text-gray-700 truncate">{qcm.jd_preview}</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 ml-2 whitespace-nowrap">{qcm.attempts_count} candidates</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600",
    orange: "bg-orange-50 text-orange-600",
    pink: "bg-pink-50 text-pink-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${colorClasses[color] || "bg-gray-100 text-gray-600"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function activityIcon(type) {
  const icons = {
    new_user: "👤",
    new_qcm: "📝",
    new_attempt: "🎯",
    attempt_finished: "✅",
    qcm_published: "🚀",
  };
  return icons[type] || "📌";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}
