"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, X, Bus, Wind, Wifi, BatteryCharging, Monitor, ShieldCheck, Pill, Coffee, Eye } from "lucide-react";
import toast from "react-hot-toast";

const BUS_TYPES = [
  { id: "AC Sleeper",        label: "AC Sleeper",        desc: "Air-conditioned sleeper berths" },
  { id: "Non-AC Sleeper",    label: "Non-AC Sleeper",    desc: "Sleeper berths without AC" },
  { id: "AC Seater",         label: "AC Seater",         desc: "Air-conditioned push-back seats" },
  { id: "Non-AC Seater",     label: "Non-AC Seater",     desc: "Regular seats without AC" },
  { id: "AC Seater/Sleeper", label: "AC Seater/Sleeper", desc: "Mix of AC seats and berths" },
];

const AMENITIES = [
  "WiFi", "USB Charging", "Charging Point", "Blanket", "Pillow",
  "Water Bottle", "Snacks", "Reading Light", "Movie", "Air Freshener",
  "GPS Tracked", "CCTV", "Emergency Exit", "First Aid", "Fire Extinguisher", "Sleeper Curtain",
];

const emptyPoint = () => ({ name: "", address: "", time: "" });

const STEPS = ["Basic Info", "Amenities & Photos", "Boarding & Dropping"];

export default function AddBusPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    busName: "", busNumber: "", serviceNumber: "", busType: "",
    totalSeats: "", status: "active",
    amenities: [], photos: [],
    boardingPoints: [emptyPoint()],
    droppingPoints: [emptyPoint()],
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.busName.trim()) e.busName = "Bus name is required";
      if (!form.busNumber.trim()) e.busNumber = "Bus number is required";
      if (!form.busType) e.busType = "Select a bus type";
    }
    if (step === 2) {
      const bpErr = form.boardingPoints.some((p) => !p.name.trim());
      if (bpErr) e.boardingPoints = "All boarding points need a name";
      const dpErr = form.droppingPoints.some((p) => !p.name.trim());
      if (dpErr) e.droppingPoints = "All dropping points need a name";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const toggleAmenity = (a) => set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const addBoardingPoint = () => set("boardingPoints", [...form.boardingPoints, emptyPoint()]);
  const removeBoardingPoint = (i) => set("boardingPoints", form.boardingPoints.filter((_, j) => j !== i));
  const updateBoardingPoint = (i, k, v) => set("boardingPoints", form.boardingPoints.map((p, j) => j === i ? { ...p, [k]: v } : p));

  const addDroppingPoint = () => set("droppingPoints", [...form.droppingPoints, emptyPoint()]);
  const removeDroppingPoint = (i) => set("droppingPoints", form.droppingPoints.filter((_, j) => j !== i));
  const updateDroppingPoint = (i, k, v) => set("droppingPoints", form.droppingPoints.map((p, j) => j === i ? { ...p, [k]: v } : p));

  const handleSave = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/operator/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalSeats: Number(form.totalSeats) || 0 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to save");
      toast.success("Bus added successfully!");
      router.push("/dashboard/buses");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const Input = ({ field, ...props }) => (
    <input
      value={form[field]} onChange={(e) => set(field, e.target.value)}
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors[field] ? "border-red-400" : "border-slate-200"}`}
      {...props}
    />
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard" className="hover:text-brand">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/buses" className="hover:text-brand">Buses</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium">Add Bus</span>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Add New Bus</h1>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-brand" : "text-slate-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-colors ${i < step ? "bg-brand border-brand text-white" : i === step ? "border-brand text-brand bg-brand/10" : "border-slate-300 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-brand" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bus Name" required error={errors.busName}>
              <Input field="busName" placeholder="e.g. Shivneri Express" />
            </Field>
            <Field label="Bus Number" required error={errors.busNumber}>
              <Input field="busNumber" placeholder="e.g. MH12 AB 1234" />
            </Field>
            <Field label="Service Number">
              <Input field="serviceNumber" placeholder="e.g. SVC-001" />
            </Field>
            <Field label="Total Seats">
              <Input field="totalSeats" type="number" min="1" placeholder="e.g. 48" />
            </Field>
          </div>

          <Field label="Bus Type" required error={errors.busType}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
              {BUS_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => set("busType", t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.busType === t.id ? "border-brand bg-brand/5" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`text-sm font-semibold ${form.busType === t.id ? "text-brand" : "text-slate-700"}`}>{t.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Status">
            <div className="flex gap-3">
              {["active","inactive"].map((s) => (
                <button key={s} type="button" onClick={() => set("status", s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-all ${form.status === s ? (s === "active" ? "border-green-500 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-600") : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${form.amenities.includes(a) ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {a}
                </button>
              ))}
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">{form.amenities.length} amenities selected</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Photos (optional)</h3>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <Bus size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 mb-3">Add photo URLs for your bus</p>
              <button type="button" onClick={() => {
                const url = prompt("Enter photo URL:");
                if (url?.trim()) set("photos", [...form.photos, url.trim()]);
              }} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors">
                + Add Photo URL
              </button>
            </div>
            {form.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200" onError={(e) => e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f1f5f9' width='80' height='80'/%3E%3C/svg%3E"} />
                    <button onClick={() => set("photos", form.photos.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Boarding Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Boarding Points</h3>
              <button type="button" onClick={addBoardingPoint} className="text-sm text-brand font-medium flex items-center gap-1 hover:text-brand-700">
                <Plus size={14} /> Add
              </button>
            </div>
            {errors.boardingPoints && <p className="text-xs text-red-500 mb-2">{errors.boardingPoints}</p>}
            <div className="space-y-3">
              {form.boardingPoints.map((pt, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Point {i + 1}</span>
                    {form.boardingPoints.length > 1 && (
                      <button type="button" onClick={() => removeBoardingPoint(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input value={pt.name} onChange={(e) => updateBoardingPoint(i, "name", e.target.value)} placeholder="City / Location*" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                    <input value={pt.address} onChange={(e) => updateBoardingPoint(i, "address", e.target.value)} placeholder="Address / Landmark" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                    <input value={pt.time} onChange={(e) => updateBoardingPoint(i, "time", e.target.value)} placeholder="Pickup Time (e.g. 06:00 AM)" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropping Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Dropping Points</h3>
              <button type="button" onClick={addDroppingPoint} className="text-sm text-brand font-medium flex items-center gap-1 hover:text-brand-700">
                <Plus size={14} /> Add
              </button>
            </div>
            {errors.droppingPoints && <p className="text-xs text-red-500 mb-2">{errors.droppingPoints}</p>}
            <div className="space-y-3">
              {form.droppingPoints.map((pt, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Point {i + 1}</span>
                    {form.droppingPoints.length > 1 && (
                      <button type="button" onClick={() => removeDroppingPoint(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input value={pt.name} onChange={(e) => updateDroppingPoint(i, "name", e.target.value)} placeholder="City / Location*" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                    <input value={pt.address} onChange={(e) => updateDroppingPoint(i, "address", e.target.value)} placeholder="Address / Landmark" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                    <input value={pt.time} onChange={(e) => updateDroppingPoint(i, "time", e.target.value)} placeholder="Drop Time (e.g. 10:00 AM)" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Preview */}
          {(form.boardingPoints.some((p) => p.name) || form.droppingPoints.some((p) => p.name)) && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Route Preview</h4>
              <div className="flex flex-wrap gap-2 items-center text-sm">
                {form.boardingPoints.filter((p) => p.name).map((p, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="font-medium text-slate-700">{p.name}</span>
                    {p.time && <span className="text-slate-400 text-xs">({p.time})</span>}
                    <span className="text-slate-300 mx-1">→</span>
                  </span>
                ))}
                {form.droppingPoints.filter((p) => p.name).map((p, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="font-medium text-slate-700">{p.name}</span>
                    {p.time && <span className="text-slate-400 text-xs">({p.time})</span>}
                    {i < form.droppingPoints.filter((p) => p.name).length - 1 && <span className="text-slate-300 mx-1">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        {step > 0 ? (
          <button onClick={back} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <Link href="/dashboard/buses" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancel
          </Link>
        )}
        <span className="text-xs text-slate-400 font-medium">Step {step + 1} of {STEPS.length}</span>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-60">
            {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            Save Bus
          </button>
        )}
      </div>
    </div>
  );
}
