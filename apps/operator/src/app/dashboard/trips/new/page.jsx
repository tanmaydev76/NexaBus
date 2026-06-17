"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function FormSelect({ label, required, value, onChange, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <select value={value} onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white ${error ? "border-red-400" : "border-slate-200"}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormInput({ label, required, value, onChange, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input value={value} onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${error ? "border-red-400" : "border-slate-200"}`}
        {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function ScheduleTripPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [errors, setErrors] = useState({});
  const [recurring, setRecurring] = useState(false);

  const [form, setForm] = useState({
    busId: "", routeId: "", departureDate: "", departureTime: "",
    arrivalTime: "", fare: "", notes: "",
    recurringDays: [], repeatUntil: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [br, rr] = await Promise.all([
          fetch("/api/operator/buses"),
          fetch("/api/operator/routes"),
        ]);
        const [bd, rd] = await Promise.all([br.json(), rr.json()]);
        setBuses((bd.buses || []).filter((b) => b.status === "active"));
        setRoutes((rd.routes || []).filter((r) => r.status === "active"));
      } catch { toast.error("Failed to load buses/routes"); }
    })();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (d) => set("recurringDays",
    form.recurringDays.includes(d)
      ? form.recurringDays.filter((x) => x !== d)
      : [...form.recurringDays, d]
  );

  const validate = () => {
    const e = {};
    if (!form.busId) e.busId = "Select a bus";
    if (!form.routeId) e.routeId = "Select a route";
    if (!form.departureDate) e.departureDate = "Departure date is required";
    if (!form.departureTime) e.departureTime = "Departure time is required";
    if (!form.fare) e.fare = "Fare is required";
    if (recurring && form.recurringDays.length === 0) e.recurringDays = "Select at least one day";
    if (recurring && !form.repeatUntil) e.repeatUntil = "Repeat until date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = { ...form, fare: Number(form.fare) };
      if (!recurring) { delete body.recurringDays; delete body.repeatUntil; }
      const r = await fetch("/api/operator/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to save");
      const count = d.count || 1;
      toast.success(count > 1 ? `${count} trips scheduled!` : "Trip scheduled!");
      router.push("/dashboard/trips");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const selectedRoute = routes.find((r) => r._id === form.routeId);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-brand">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/trips" className="hover:text-brand">Trips</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Schedule Trip</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Schedule a Trip</h1>

      <div className="space-y-5">
        {/* Bus & Route */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Bus & Route</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect label="Bus" required value={form.busId} onChange={(e) => set("busId", e.target.value)} error={errors.busId}>
              <option value="">Select a bus</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>{b.busName} – {b.busNumber}</option>
              ))}
            </FormSelect>
            <FormSelect label="Route" required value={form.routeId} onChange={(e) => set("routeId", e.target.value)} error={errors.routeId}>
              <option value="">Select a route</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>{r.routeName} ({r.origin} → {r.destination})</option>
              ))}
            </FormSelect>
          </div>

          {selectedRoute && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              <span className="text-green-600 font-medium">{selectedRoute.origin}</span>
              <span className="text-slate-300">→</span>
              {(selectedRoute.stops || []).map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-slate-500">{s.name}</span>
                  <span className="text-slate-300">→</span>
                </span>
              ))}
              <span className="text-red-600 font-medium">{selectedRoute.destination}</span>
              {selectedRoute.estimatedDuration && <span className="ml-auto text-xs text-slate-400">{selectedRoute.estimatedDuration}</span>}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="Departure Date" required value={form.departureDate} onChange={(e) => set("departureDate", e.target.value)} error={errors.departureDate} type="date" />
            <FormInput label="Departure Time" required value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} error={errors.departureTime} type="time" />
            <FormInput label="Arrival Time (est.)" value={form.arrivalTime} onChange={(e) => set("arrivalTime", e.target.value)} type="time" />
          </div>
        </div>

        {/* Fare */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Fare & Notes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fare (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input value={form.fare} onChange={(e) => set("fare", e.target.value)} type="number" min="0" placeholder="500"
                  className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors.fare ? "border-red-400" : "border-slate-200"}`} />
              </div>
              {errors.fare && <p className="text-xs text-red-500 mt-1">{errors.fare}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any notes about this trip..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
          </div>
        </div>

        {/* Recurring */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Recurring Schedule</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automatically create trips on selected days</p>
            </div>
            <button type="button" onClick={() => setRecurring(!recurring)}
              className={`relative w-11 h-6 rounded-full transition-colors ${recurring ? "bg-brand" : "bg-slate-200"}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${recurring ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {recurring && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Repeat on days <span className="text-red-500">*</span></label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`w-10 h-10 rounded-full text-xs font-bold border-2 transition-all ${form.recurringDays.includes(d) ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {d}
                    </button>
                  ))}
                </div>
                {errors.recurringDays && <p className="text-xs text-red-500 mt-1">{errors.recurringDays}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Repeat until <span className="text-red-500">*</span></label>
                  <input value={form.repeatUntil} onChange={(e) => set("repeatUntil", e.target.value)} type="date" min={form.departureDate}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors.repeatUntil ? "border-red-400" : "border-slate-200"}`} />
                  {errors.repeatUntil && <p className="text-xs text-red-500 mt-1">{errors.repeatUntil}</p>}
                </div>
              </div>
              {form.recurringDays.length > 0 && form.departureDate && form.repeatUntil && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <RefreshCw size={12} className="text-blue-500" />
                  Trips will be created on {form.recurringDays.join(", ")} from {form.departureDate} to {form.repeatUntil}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
        <Link href="/dashboard/trips" className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          Cancel
        </Link>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {recurring ? "Schedule Recurring Trips" : "Schedule Trip"}
        </button>
      </div>
    </div>
  );
}
