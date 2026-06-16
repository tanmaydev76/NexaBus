"use client";
import useBookingStore from "@/store/bookingStore";

const SLOTS = [
  { id: "before_6", label: "Before 6 AM", icon: "🌙", sub: "00:00–06:00" },
  { id: "6_to_12",  label: "6 AM–12 PM",  icon: "🌅", sub: "06:00–12:00" },
  { id: "12_to_18", label: "12 PM–6 PM",  icon: "☀️", sub: "12:00–18:00" },
  { id: "after_18", label: "After 6 PM",  icon: "🌆", sub: "18:00–24:00" },
];

export default function TimeSlotGrid({ type }) {
  const { filters, toggleDepartureSlot, toggleArrivalSlot } = useBookingStore();
  const active = type === "departure" ? filters.departureSlots : filters.arrivalSlots;
  const toggle = type === "departure" ? toggleDepartureSlot : toggleArrivalSlot;

  return (
    <div className="grid grid-cols-2 gap-2">
      {SLOTS.map(({ id, label, icon, sub }) => {
        const isActive = active.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`rounded-lg border p-2.5 text-center transition-all
              ${isActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/40"}`}
          >
            <div className="text-base mb-0.5">{icon}</div>
            <div className={`text-[11px] font-semibold leading-tight ${isActive ? "text-blue-600" : "text-gray-700"}`}>
              {label}
            </div>
            <div className="text-[9px] text-gray-400 mt-0.5">{sub}</div>
          </button>
        );
      })}
    </div>
  );
}
