"use client";

import { useEffect, useState } from "react";
import { Star, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Request } from "@/db/schema";

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

const statusColors: Record<string, string> = {
  requested: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  acquired: "bg-green-500/10 text-green-700 dark:text-green-400",
  declined: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [requestedBy, setRequestedBy] = useState("Aaron");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  const fetchRequests = () => {
    fetch("/api/requests")
      .then((r) => r.json() as Promise<Request[]>)
      .then((data) => {
        setRequests(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        year: year ? parseInt(year) : null,
        requestedBy,
        priority,
        notes: notes.trim() || null,
      }),
    });

    setTitle("");
    setYear("");
    setNotes("");
    setShowForm(false);
    fetchRequests();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchRequests();
  };

  const activeRequests = requests.filter((r) => r.status === "requested");
  const completedRequests = requests.filter((r) => r.status !== "requested");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Requests</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Request
        </button>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Request movies to add to the collection. Great for when you or your wife spot something you want.
      </p>

      {showForm && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Movie Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Godfather"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1972"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Requested by
              </label>
              <select
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              >
                <option value="Aaron">Aaron</option>
                <option value="Wife">Wife</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Submit Request
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Active Requests ({activeRequests.length})
          </h2>
          {activeRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {req.title}
                  {req.year && (
                    <span className="text-zinc-400 font-normal ml-1">
                      ({req.year})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {req.requestedBy && (
                    <span className="text-xs text-zinc-500">
                      by {req.requestedBy}
                    </span>
                  )}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      priorityColors[req.priority || "medium"]
                    )}
                  >
                    {req.priority}
                  </span>
                </div>
                {req.notes && (
                  <p className="text-sm text-zinc-500 mt-1">{req.notes}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => updateStatus(req.id, "acquired")}
                  className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                  title="Mark as acquired"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateStatus(req.id, "declined")}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Decline"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completedRequests.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Completed ({completedRequests.length})
          </h2>
          {completedRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-60"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {req.title}
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  statusColors[req.status]
                )}
              >
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && requests.length === 0 && !showForm && (
        <div className="text-center py-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Star className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">No requests yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Click &quot;Add Request&quot; to request a movie
          </p>
        </div>
      )}
    </div>
  );
}
