"use client";
import { Star, Pencil, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";

function getAvatarStyle(gender) {
  if (gender === "Female") return "bg-pink-100 text-pink-600";
  if (gender === "Other") return "bg-purple-100 text-purple-600";
  return "bg-blue-100 text-blue-600";
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function maskMobile(num) {
  return num.slice(0, 5) + " " + num.slice(5);
}

export default function TravellerCard({ traveller, onEdit, onDelete, onSetPrimary, onRefresh }) {
  async function handleSetPrimary() {
    try {
      const res = await fetch(`/api/travellers/${traveller._id}/set-primary`, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success(`${traveller.fullName} set as primary traveller`);
      onRefresh();
    } catch {
      toast.error("Failed to set primary");
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${traveller.fullName}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/travellers/${traveller._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Traveller deleted");
      onDelete(traveller._id);
    } catch {
      toast.error("Failed to delete traveller");
    }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all flex flex-col gap-4 ${traveller.isPrimary ? "border-2 border-blue-500" : "border-gray-200"}`}>
      {/* Top row: avatar + info + badge */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${getAvatarStyle(traveller.gender)}`}>
          {getInitials(traveller.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{traveller.fullName}</span>
            {traveller.isPrimary && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                <Star size={9} fill="currentColor" /> Primary
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{traveller.gender} · {traveller.age} yrs</p>
          <p className="text-xs text-gray-600 mt-1 font-medium">📱 {maskMobile(traveller.mobileNumber)}</p>
          {traveller.emailAddress && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">✉️ {traveller.emailAddress}</p>
          )}
          {traveller.bookingCount > 0 && (
            <p className="text-[11px] text-gray-400 mt-1">Used {traveller.bookingCount} time{traveller.bookingCount !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(traveller)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        {!traveller.isPrimary && (
          <button
            onClick={handleSetPrimary}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Check size={12} /> Set Primary
          </button>
        )}
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors ml-auto"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
