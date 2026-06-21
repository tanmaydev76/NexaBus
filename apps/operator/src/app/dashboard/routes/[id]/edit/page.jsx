"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import StopPointsSection from "@/components/StopPointsSection";

function LabeledInput({ label, required, value, onChange, error, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${error ? "border-red-400" : "border-slate-200"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const emptyPoint = (order) => ({ name: "", time: "", landmark: "", contactNumber: "", order });

export default function EditRoutePage() {
  const router = useRouter();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    routeName: "", routeNumber: "", origin: "", destination: "",
    estimatedDuration: "", distance: "", status: "active",
    stops: [],
    boardingPoints: [emptyPoint(1)],
    droppingPoints: [emptyPoint(1)],
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/operator/routes/${id}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        const rt = d.route;
        setForm({
          routeName:      rt.routeName || "",
          routeNumber:    rt.routeNumber || "",
          origin:         rt.origin || "",
          destination:    rt.destination || "",
          estimatedDuration: rt.estimatedDuration || "",
          distance:       rt.distance ? String(rt.distance) : "",
          status:         rt.status || "active",
          stops:          rt.stops || [],
          boardingPoints: rt.boardingPoints || [],
          droppingPoints: rt.droppingPoints || [],
        });
      } catch { toast.error("Failed to load route"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Via stops
  const addStop    = () => set("stops", [...form.stops, { name: "", arrivalTime: "", departureTime: "" }]);
  const removeStop = (i) => set("stops", form.stops.filter((_, j) => j !== i));
  const updateStop = (i, k, v) => set("stops", form.stops.map((s, j) => j === i ? { ...s, [k]: v } : s));

  // Boarding points
  const addBoarding    = () => set("boardingPoints", [...form.boardingPoints, emptyPoint(form.boardingPoints.length + 1)]);
  const removeBoarding = (i) => set("boardingPoints", form.boardingPoints.filter((_, j) => j !== i).map((p, j) => ({ ...p, order: j + 1 })));
  const updateBoarding = (i, k, v) => set("boardingPoints", form.boardingPoints.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const moveBoarding   = (i, dir) => {
    const pts = [...form.boardingPoints];
    const j = i + dir;
    if (j < 0 || j >= pts.length) return;
    [pts[i], pts[j]] = [pts[j], pts[i]];
    set("boardingPoints", pts.map((p, idx) => ({ ...p, order: idx + 1 })));
  };

  // Dropping points
  const addDropping    = () => set("droppingPoints", [...form.droppingPoints, emptyPoint(form.droppingPoints.length + 1)]);
  const removeDropping = (i) => set("droppingPoints", form.droppingPoints.filter((_, j) => j !== i).map((p, j) => ({ ...p, order: j + 1 })));
  const updateDropping = (i, k, v) => set("droppingPoints", form.droppingPoints.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const moveDropping   = (i, dir) => {
    const pts = [...form.droppingPoints];
    const j = i + dir;
    if (j < 0 || j >= pts.length) return;
    [pts[i], pts[j]] = [pts[j], pts[i]];
    set("droppingPoints", pts.map((p, idx) => ({ ...p, order: idx + 1 })));
  };

  const validate = () => {
    const e = {};
    if (!form.routeName.trim()) e.routeName = "Route name is required";
    if (!form.origin.trim()) e.origin = "Origin is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    if (form.boardingPoints.some((p) => !p.name.trim() || !p.time))
      e.boardingPoints = "All boarding points need a name and time";
    if (form.droppingPoints.some((p) => !p.name.trim() || !p.time))
      e.droppingPoints = "All dropping points need a name and time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/operator/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, distance: Number(form.distance) || undefined }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to save");
      toast.success("Route updated!");
      router.push("/dashboard/routes");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-brand">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/routes" className="hover:text-brand">Routes</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Edit Route</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Route</h1>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput label="Route Name" required value={form.routeName} onChange={(e) => set("routeName", e.target.value)} error={errors.routeName} placeholder="e.g. Mumbai - Pune Express" />
            <LabeledInput label="Route Number" value={form.routeNumber} onChange={(e) => set("routeNumber", e.target.value)} placeholder="e.g. RT-001" />
            <LabeledInput label="Origin" required value={form.origin} onChange={(e) => set("origin", e.target.value)} error={errors.origin} placeholder="e.g. Mumbai" />
            <LabeledInput label="Destination" required value={form.destination} onChange={(e) => set("destination", e.target.value)} error={errors.destination} placeholder="e.g. Pune" />
            <LabeledInput label="Estimated Duration" value={form.estimatedDuration} onChange={(e) => set("estimatedDuration", e.target.value)} placeholder="e.g. 3h 30m" />
            <LabeledInput label="Distance (km)" value={form.distance} onChange={(e) => set("distance", e.target.value)} type="number" placeholder="e.g. 150" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex gap-3">
              {["active", "inactive"].map((s) => (
                <button key={s} type="button" onClick={() => set("status", s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-all ${form.status === s ? (s === "active" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Via Stops */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Via Stops <span className="text-slate-400 font-normal text-sm">(optional)</span></h3>
            <button type="button" onClick={addStop} className="text-sm text-brand font-medium flex items-center gap-1 hover:text-brand-700">
              <Plus size={14} /> Add Stop
            </button>
          </div>
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
            <p className="text-sm text-slate-400 text-center py-2">No intermediate stops.</p>
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

        {/* Boarding Points */}
        <StopPointsSection
          title="Boarding Points"
          color="green"
          points={form.boardingPoints}
          city={form.origin}
          timeLabel="Pickup Time"
          onAdd={addBoarding}
          onRemove={removeBoarding}
          onUpdate={updateBoarding}
          onMoveUp={(i) => moveBoarding(i, -1)}
          onMoveDown={(i) => moveBoarding(i, 1)}
          error={errors.boardingPoints}
        />

        {/* Dropping Points */}
        <StopPointsSection
          title="Dropping Points"
          color="red"
          points={form.droppingPoints}
          city={form.destination}
          timeLabel="Arrival Time"
          onAdd={addDropping}
          onRemove={removeDropping}
          onUpdate={updateDropping}
          onMoveUp={(i) => moveDropping(i, -1)}
          onMoveDown={(i) => moveDropping(i, 1)}
          error={errors.droppingPoints}
        />
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
        <Link href="/dashboard/routes" className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          Cancel
        </Link>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
          {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
