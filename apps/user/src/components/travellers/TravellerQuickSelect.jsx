"use client";
import { Check, Plus } from "lucide-react";

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

export default function TravellerQuickSelect({ travellers, selectedId, onSelect }) {
  if (!travellers || travellers.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
        Select from saved travellers
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {travellers.map((t) => {
          const isSelected = selectedId === String(t._id);
          return (
            <button
              key={t._id}
              type="button"
              onClick={() => onSelect(t)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 border rounded-xl px-3 py-2.5 cursor-pointer transition-all min-w-[72px] ${
                isSelected
                  ? "border-2 border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 bg-white"
              }`}
            >
              <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarStyle(t.gender)}`}>
                {getInitials(t.fullName)}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={9} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className={`text-[11px] font-semibold leading-tight truncate max-w-[60px] ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {t.fullName.split(" ")[0]}
                </p>
                <p className="text-[10px] text-gray-400">{t.age}y</p>
              </div>
              {t.isPrimary && (
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Primary</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">or fill manually</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
    </div>
  );
}
