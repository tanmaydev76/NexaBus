"use client";
import { ShieldCheck, AirVent, BedDouble, Armchair, Sunset, Star, MapPin, CheckCircle2 } from "lucide-react";
import useBookingStore from "@/store/bookingStore";
import { mockBuses } from "@/lib/mockData";

const CHIPS = [
  {
    id: "free_cancellation",
    label: "Free Cancellation",
    Icon: ShieldCheck,
    fullWidth: true,
    count: mockBuses.filter((b) => b.freeCancellation).length,
  },
  {
    id: "ac",
    label: "AC",
    Icon: AirVent,
    fullWidth: false,
    count: mockBuses.filter((b) => b.isAC).length,
  },
  {
    id: "sleeper",
    label: "SLEEPER",
    Icon: BedDouble,
    fullWidth: false,
    count: mockBuses.filter((b) => b.isSleeper).length,
  },
  {
    id: "single_seats",
    label: "Single Seats",
    Icon: Armchair,
    fullWidth: true,
    count: mockBuses.filter((b) => b.isSingleWindow).length,
  },
  {
    id: "evening",
    label: "18:00–24:00",
    Icon: Sunset,
    fullWidth: true,
    count: mockBuses.filter((b) => parseInt(b.departure) >= 18).length,
  },
  {
    id: "high_rated",
    label: "High Rated Buses",
    Icon: Star,
    fullWidth: true,
    count: mockBuses.filter((b) => b.rating >= 4.0).length,
  },
  {
    id: "live_tracking",
    label: "Live Tracking",
    Icon: MapPin,
    fullWidth: true,
    count: mockBuses.filter((b) => b.hasLiveTracking).length,
  },
  {
    id: "volvo",
    label: "Volvo Buses",
    Icon: CheckCircle2,
    fullWidth: true,
    count: mockBuses.filter((b) => b.isVolvo).length,
  },
];

export default function QuickFilterChips() {
  const { filters, toggleQuickFilter } = useBookingStore();
  const active = filters.quickFilters;

  return (
    <div className="flex flex-wrap gap-2 mb-1">
      {CHIPS.map(({ id, label, Icon, fullWidth, count }) => {
        const isActive = active.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleQuickFilter(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
              ${fullWidth ? "w-full" : "flex-1"}
              ${isActive
                ? "border-2 border-blue-500 bg-blue-50 text-blue-600"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm"}`}
          >
            <Icon size={15} className={isActive ? "text-blue-500 flex-shrink-0" : "text-gray-400 flex-shrink-0"} />
            <span className="truncate">{label} ({count})</span>
          </button>
        );
      })}
    </div>
  );
}
