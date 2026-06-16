"use client";
import useBookingStore from "@/store/bookingStore";
import { mockBuses } from "@/lib/mockData";

const BUS_TYPES = [
  { label: "Seater",         match: (b) => b.busType.includes("Seater") },
  { label: "Sleeper",        match: (b) => b.isSleeper },
  { label: "AC Seater",      match: (b) => b.isAC && !b.isSleeper },
  { label: "AC Sleeper",     match: (b) => b.isAC && b.isSleeper },
  { label: "Non-AC Sleeper", match: (b) => !b.isAC && b.isSleeper },
  { label: "Volvo",          match: (b) => b.isVolvo },
];

export default function BusTypeCheckboxes() {
  const { filters, toggleBusType } = useBookingStore();

  return (
    <div className="space-y-3">
      {BUS_TYPES.map(({ label, match }) => {
        const count = mockBuses.filter(match).length;
        const checked = filters.busTypes.includes(label);
        return (
          <label key={label} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => toggleBusType(label)}
              className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors
                ${checked ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-300"}`}
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm flex-1 ${checked ? "text-blue-600 font-medium" : "text-gray-700"}`}>{label}</span>
            <span className="text-xs text-gray-400">({count})</span>
          </label>
        );
      })}
    </div>
  );
}
