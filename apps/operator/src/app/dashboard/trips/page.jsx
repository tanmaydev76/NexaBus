"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, Clock, Bus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
};

function TripCard({ trip, onDelete }) {
  const bus = trip.busId;
  const route = trip.routeId;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <span>{route?.origin || "?"}</span>
            <span className="text-slate-400">→</span>
            <span>{route?.destination || "?"}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{route?.routeName || "Route"}</div>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${STATUS_STYLES[trip.status] || STATUS_STYLES.scheduled}`}>
          {trip.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Calendar size={11} />{trip.departureDate}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{trip.departureTime}{trip.arrivalTime ? ` – ${trip.arrivalTime}` : ""}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
        <Bus size={12} className="text-slate-400 flex-shrink-0" />
        <span className="font-medium">{bus?.busName || "Bus"}</span>
        {bus?.busNumber && <span className="text-slate-400 font-mono">{bus.busNumber}</span>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-brand">₹{trip.fare?.toLocaleString()}</span>
        <button onClick={() => onDelete(trip)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rangeFilter, setRangeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (rangeFilter) params.set("range", rangeFilter);
      const r = await fetch(`/api/operator/trips?${params}`);
      const d = await r.json();
      setTrips(d.trips || []);
    } catch { toast.error("Failed to load trips"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, [statusFilter, rangeFilter]);

  const filtered = useMemo(() => trips.filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const route = t.routeId;
    return (
      route?.origin?.toLowerCase().includes(q) ||
      route?.destination?.toLowerCase().includes(q) ||
      route?.routeName?.toLowerCase().includes(q) ||
      t.busId?.busName?.toLowerCase().includes(q)
    );
  }), [trips, search]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const r = await fetch(`/api/operator/trips/${deleteTarget._id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Trip deleted");
      setTrips((prev) => prev.filter((t) => t._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete trip"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Trips</h1>
          <p className="text-sm text-slate-500 mt-0.5">{trips.length} trips scheduled</p>
        </div>
        <Link href="/dashboard/trips/new" className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Schedule Trip
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route or bus..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
        <select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded" />
              <div className="h-5 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No trips found</h3>
          <p className="text-sm text-slate-400 mb-4">Schedule your first trip to get started</p>
          <Link href="/dashboard/trips/new" className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700">
            + Schedule Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip) => (
            <TripCard key={trip._id} trip={trip} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Trip"
          message="Delete this trip? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
