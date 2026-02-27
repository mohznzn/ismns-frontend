"use client";

import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

const ICONS = {
  new_user: "👤",
  new_qcm: "📝",
  new_attempt: "🎯",
  attempt_finished: "✅",
  qcm_published: "🚀",
};

const TYPE_LABELS = {
  new_user: "New Recruiter",
  new_qcm: "New Assessment",
  new_attempt: "Test Started",
  attempt_finished: "Test Completed",
  qcm_published: "Assessment Published",
};

const TYPE_COLORS = {
  new_user: "bg-blue-50 border-blue-200",
  new_qcm: "bg-purple-50 border-purple-200",
  new_attempt: "bg-yellow-50 border-yellow-200",
  attempt_finished: "bg-green-50 border-green-200",
  qcm_published: "bg-indigo-50 border-indigo-200",
};

export default function SuperAdminActivity() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/super-admin/activity?limit=100`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      setItems(json.items || []);
    } catch (err) {
      console.error("[Activity] Load failed:", err);
      alert("Error loading activity");
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  const grouped = {};
  filtered.forEach(item => {
    if (!item.date) return;
    const day = new Date(item.date).toLocaleDateString();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All activities</option>
            <option value="new_user">New Recruiters</option>
            <option value="new_qcm">New Assessments</option>
            <option value="qcm_published">Published</option>
            <option value="new_attempt">Tests Started</option>
            <option value="attempt_finished">Tests Completed</option>
          </select>
          <button
            onClick={loadActivity}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(
          items.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
          }, {})
        ).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? "all" : type)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filter === type ? "ring-2 ring-blue-500" : ""
            } ${TYPE_COLORS[type] || "bg-gray-50 border-gray-200"}`}
          >
            <span>{ICONS[type] || "📌"}</span>
            <span className="font-medium">{TYPE_LABELS[type] || type}</span>
            <span className="text-gray-500">({count})</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No activity found
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayItems]) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 py-1 px-2 rounded">
                {day}
              </h3>
              <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
                {dayItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${TYPE_COLORS[item.type] || "bg-gray-50"}`}>
                      {ICONS[item.type] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{item.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type] || "bg-gray-50"}`}>
                          {TYPE_LABELS[item.type] || item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
