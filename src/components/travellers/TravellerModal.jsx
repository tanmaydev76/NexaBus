"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = { fullName: "", age: "", gender: "", mobileNumber: "", emailAddress: "", isPrimary: false };

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function TravellerModal({ isOpen, onClose, editTraveller, onSaved }) {
  const isEdit = !!editTraveller;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(editTraveller ? {
        fullName: editTraveller.fullName,
        age: String(editTraveller.age),
        gender: editTraveller.gender,
        mobileNumber: editTraveller.mobileNumber,
        emailAddress: editTraveller.emailAddress || "",
        isPrimary: editTraveller.isPrimary,
      } : EMPTY);
      setErrors({});
    }
  }, [isOpen, editTraveller]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = "Minimum 2 characters";
    if (!form.age || isNaN(form.age) || form.age < 1 || form.age > 120) e.age = "Enter age between 1–120";
    if (!form.gender) e.gender = "Select a gender";
    if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = "Enter valid 10-digit mobile number";
    if (form.emailAddress && !/^\S+@\S+\.\S+$/.test(form.emailAddress)) e.emailAddress = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const url = isEdit ? `/api/travellers/${editTraveller._id}` : "/api/travellers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(isEdit ? "Traveller updated!" : "Traveller saved!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit Traveller" : "Add New Traveller"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Full Name *" error={errors.fullName}>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? "border-red-400" : "border-gray-200"}`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Age *" error={errors.age}>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="25"
                min={1} max={120}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.age ? "border-red-400" : "border-gray-200"}`}
              />
            </Field>

            <Field label="Gender *" error={errors.gender}>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.gender ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <Field label="Mobile Number *" error={errors.mobileNumber}>
            <input
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => set("mobileNumber", e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mobileNumber ? "border-red-400" : "border-gray-200"}`}
            />
          </Field>

          <Field label="Email Address (optional)" error={errors.emailAddress}>
            <input
              type="email"
              value={form.emailAddress}
              onChange={(e) => set("emailAddress", e.target.value)}
              placeholder="rahul@gmail.com"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emailAddress ? "border-red-400" : "border-gray-200"}`}
            />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => set("isPrimary", e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
              Set as primary traveller
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving…</>
              ) : (
                isEdit ? "Update Traveller" : "Save Traveller"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
