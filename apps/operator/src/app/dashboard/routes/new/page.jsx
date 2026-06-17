"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AddRoutePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    routeName: "", routeNumber: "", origin: "", destination: "",
    estimatedDuration: "", distance: "", status: "active",
    stops: [],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addStop = () => set("stops", [...form.stops, { name: "", arrivalTime: "", departureTime: "" }]);
  const removeStop = (i) => set("stops", form.stops.filter((_, j) => j !== i));
  const updateStop = (i, k, v) => set("stops", form.stops.map((s, j) => j === i ? { ...s, [k]: v } : s));

  const validate = () => {
    const e = {};
    if (!form.routeName.trim()) e.routeName = "Route name is required";
    if (!form.origin.trim()) e.origin = "Origin is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/operator/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, distance: Number(form.distance) || undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to save");
      toast.success("Route created!");
      router.push("/dashboard/routes");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const Input = ({ field, label, required, ...props }) => (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input value={form[field]} onChange={(e) => set(field, e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors[field] ? "border-red-400" : "border-slate-200"}`}
        {...props} />
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-brand">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/routes" className="hover:text-brand">Routes</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Add Route</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Add New Route</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input field="routeName" label="Route Name" required placeholder="e.g. Mumbai - Pune Express" />
            <Input field="routeNumber" label="Route Number" placeholder="e.g. RT-001" />
            <Input field="origin" label="Origin" required placeholder="e.g. Mumbai" />
            <Input field="destination" label="Destination" required placeholder="e.g. Pune" />
            <Input field="estimatedDuration" label="Estimated Duration" placeholder="e.g. 3h 30m" />
            <Input field="distance" label="Distance (km)" type="number" placeholder="e.g. 150" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-3">
              {["active","inactive"].map((s) => (
                <button key={s} type="button" onClick={() => set("status", s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-all ${form.status === s ? (s === "active" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Via Stops (optional)</h3>
            <button type="button" onClick={addStop} className="text-sm text-brand font-medium flex items-center gap-1 hover:text-brand-700">
              <Plus size={14} /> Add Stop
            </button>
          </div>

          {/* Route preview */}
          <div className="flex items-center gap-2 flex-wrap mb-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-semibold text-green-700">{form.origin || "Origin"}</span>
            </div>
            {form.stops.map((stop, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-slate-300 text-lg">→</span>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-600 font-medium">{stop.name || `Stop ${i + 1}`}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="text-slate-300 text-lg">→</span>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-semibold text-red-700">{form.destination || "Destination"}</span>
            </span>
          </div>

          {form.stops.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">No intermediate stops. Click "Add Stop" to add one.</p>
          )}

          <div className="space-y-3">
            {form.stops.map((stop, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Stop {i + 1}</span>
                  <button type="button" onClick={() => removeStop(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input value={stop.name} onChange={(e) => updateStop(i, "name", e.target.value)} placeholder="City / Location*"
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                  <input value={stop.arrivalTime} onChange={(e) => updateStop(i, "arrivalTime", e.target.value)} placeholder="Arrival Time"
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                  <input value={stop.departureTime} onChange={(e) => updateStop(i, "departureTime", e.target.value)} placeholder="Departure Time"
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
        <Link href="/dashboard/routes" className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          Cancel
        </Link>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          Create Route
        </button>
      </div>
    </div>
  );
}
