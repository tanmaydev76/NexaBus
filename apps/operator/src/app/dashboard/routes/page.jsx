"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/operator/routes");
      const d = await r.json();
      setRoutes(d.routes || []);
    } catch { toast.error("Failed to load routes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoutes(); }, []);

  const filtered = useMemo(() => routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.routeName?.toLowerCase().includes(q) || r.origin?.toLowerCase().includes(q) || r.destination?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  }), [routes, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/operator/routes/${deleteTarget._id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Route deleted");
      setRoutes((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete route"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Routes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{routes.length} routes configured</p>
        </div>
        <Link href="/dashboard/routes/new" className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Add Route
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route name, origin or destination..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">{search || statusFilter ? "No routes match your filters" : "No routes yet"}</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first route to get started</p>
          <Link href="/dashboard/routes/new" className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700">
            + Add Route
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Route</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">From → To</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Duration</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((route) => (
                <tr key={route._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{route.routeName}</div>
                    {route.routeNumber && <div className="text-xs text-slate-400 font-mono">{route.routeNumber}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="text-green-600 font-medium">{route.origin}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-red-600 font-medium">{route.destination}</span>
                    </div>
                    {route.stops?.length > 0 && (
                      <div className="text-xs text-slate-400 mt-0.5">{route.stops.length} stop{route.stops.length !== 1 ? "s" : ""}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {route.estimatedDuration ? (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock size={12} className="text-slate-400" />
                        {route.estimatedDuration}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${route.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {route.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/dashboard/routes/${route._id}/edit`} className="p-1.5 text-slate-500 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </Link>
                      <button onClick={() => setDeleteTarget(route)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Route"
          message={`Delete route "${deleteTarget.routeName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
