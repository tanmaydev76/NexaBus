"use client";
import { X } from "lucide-react";
import useBookingStore from "@/store/bookingStore";

const QUICK_LABELS = {
  free_cancellation: "Free Cancellation",
  ac: "AC",
  sleeper: "Sleeper",
  single_seats: "Single Seats",
  evening: "18:00–24:00",
  high_rated: "High Rated",
  live_tracking: "Live Tracking",
  volvo: "Volvo",
};

const SLOT_LABELS = {
  before_6: "Before 6 AM",
  "6_to_12": "6 AM–12 PM",
  "12_to_18": "12 PM–6 PM",
  after_18: "After 6 PM",
};

export default function ActiveFilterTags() {
  const {
    filters,
    toggleQuickFilter, toggleDepartureSlot, toggleArrivalSlot,
    toggleBusType, setSingleWindow,
    toggleBusFeature, toggleOperator, toggleBoardingPoint, toggleDroppingPoint, toggleAmenity,
    clearAllFilters,
  } = useBookingStore();

  const tags = [
    ...filters.quickFilters.map((id) => ({ label: QUICK_LABELS[id] || id, onRemove: () => toggleQuickFilter(id) })),
    ...filters.departureSlots.map((id) => ({ label: `Dep: ${SLOT_LABELS[id]}`, onRemove: () => toggleDepartureSlot(id) })),
    ...filters.arrivalSlots.map((id) => ({ label: `Arr: ${SLOT_LABELS[id]}`, onRemove: () => toggleArrivalSlot(id) })),
    ...filters.busTypes.map((t) => ({ label: t, onRemove: () => toggleBusType(t) })),
    ...(filters.singleWindow ? [{ label: `Single Window: ${filters.singleWindow}`, onRemove: () => setSingleWindow(null) }] : []),
    ...filters.busFeatures.map((f) => ({ label: f, onRemove: () => toggleBusFeature(f) })),
    ...filters.operators.map((o) => ({ label: o, onRemove: () => toggleOperator(o) })),
    ...filters.boardingPoints.map((p) => ({ label: `Board: ${p}`, onRemove: () => toggleBoardingPoint(p) })),
    ...filters.droppingPoints.map((p) => ({ label: `Drop: ${p}`, onRemove: () => toggleDroppingPoint(p) })),
    ...filters.amenities.map((a) => ({ label: a, onRemove: () => toggleAmenity(a) })),
  ];

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-gray-500 font-medium">Active:</span>
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200"
        >
          {tag.label}
          <button
            type="button"
            onClick={tag.onRemove}
            className="ml-0.5 text-blue-400 hover:text-blue-700 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAllFilters}
        className="text-xs text-blue-600 hover:underline font-medium"
      >
        Clear all
      </button>
    </div>
  );
}
