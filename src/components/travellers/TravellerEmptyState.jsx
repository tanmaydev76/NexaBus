import { Users } from "lucide-react";

export default function TravellerEmptyState({ onAdd }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <Users size={36} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">No travellers saved yet</h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto mb-7">
        Save passenger details to book faster next time — just one click to auto-fill!
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
      >
        + Add Your First Traveller
      </button>
    </div>
  );
}
