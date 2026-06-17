"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Bus, Edit2, Trash2, ToggleLeft, ToggleRight, Wifi, BatteryCharging, Wind, Monitor, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const TYPE_COLORS = {
  "AC Sleeper":         "bg-blue-100 text-blue-700",
  "Non-AC Sleeper":     "bg-green-100 text-green-700",
  "AC Seater":          "bg-purple-100 text-purple-700",
  "Non-AC Seater":      "bg-orange-100 text-orange-700",
  "AC Seater/Sleeper":  "bg-teal-100 text-teal-700",
};

const AMENITY_ICONS = { WiFi: Wifi, "USB Charging": BatteryCharging, "Air Freshener": Wind, Movie: Monitor, CCTV: ShieldCheck };

function AmenityChip({ label }) {
  const Icon = AMENITY_ICONS[label];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
      {Icon && <Icon size={10} />}{label}
    </span>
  );
}

function BusCard({ bus, onDelete, onToggleStatus }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight">{bus.busName}</h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{bus.busNumber}</span>
          {bus.serviceNumber && <span className="ml-1 text-xs text-slate-400">{bus.serviceNumber}</span>}
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[bus.busType] || "bg-gray-100 text-gray-600"}`}>
          {bus.busType}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {(bus.amenities || []).slice(0, 5).map((a) => <AmenityChip key={a} label={a} />)}
        {(bus.amenities || []).length > 5 && (
          <span className="text-[11px] text-slate-400">+{bus.amenities.length - 5} more</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span><span className="font-semibold text-slate-700">{bus.totalSeats}</span> seats</span>
        <button
          onClick={() => onToggleStatus(bus)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            bus.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
        >
          {bus.status === "active" ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          {bus.status === "active" ? "Active" : "Inactive"}
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link href={`/dashboard/buses/${bus._id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
          <Edit2 size={13} /> Edit
        </Link>
        <button onClick={() => onDelete(bus)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/operator/buses");
      const d = await r.json();
      setBuses(d.buses || []);
    } catch { toast.error("Failed to load buses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBuses(); }, []);

  const filtered = useMemo(() => buses.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.busName.toLowerCase().includes(q) || b.busNumber.toLowerCase().includes(q);
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchType = !typeFilter || b.busType === typeFilter;
    return matchSearch && matchStatus && matchType;
  }), [buses, search, statusFilter, typeFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/operator/buses/${deleteTarget._id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Bus deleted");
      setBuses((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete bus"); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (bus) => {
    try {
      const r = await fetch(`/api/operator/buses/${bus._id}/status`, { method: "PATCH" });
      const d = await r.json();
      setBuses((prev) => prev.map((b) => b._id === bus._id ? d.bus : b));
      toast.success(`Bus marked ${d.bus.status}`);
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Buses</h1>
          <p className="text-sm text-slate-500 mt-0.5">{buses.length} buses in your fleet</p>
        </div>
        <Link href="/dashboard/buses/new" className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Add Bus
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bus name or number..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white">
          <option value="">All Types</option>
          {["AC Sleeper","Non-AC Sleeper","AC Seater","Non-AC Seater","AC Seater/Sleeper"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mb-3">
                {[...Array(3)].map((_, j) => <div key={j} className="h-5 bg-slate-200 rounded w-16" />)}
              </div>
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Bus size={28} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">{search || statusFilter || typeFilter ? "No buses match your filters" : "No buses yet"}</h3>
          <p className="text-sm text-slate-400 mb-4">Add your first bus to get started</p>
          <Link href="/dashboard/buses/new" className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700">
            + Add Bus
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bus) => (
            <BusCard key={bus._id} bus={bus} onDelete={setDeleteTarget} onToggleStatus={handleToggle} />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Bus"
          message={`Delete "${deleteTarget.busName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
