"use client";
import { mockBuses } from "@/lib/mockData";
import useBookingStore from "@/store/bookingStore";
import QuickFilterChips from "./QuickFilterChips";
import AccordionFilter from "./AccordionFilter";
import TimeSlotGrid from "./TimeSlotGrid";
import BusTypeCheckboxes from "./BusTypeCheckboxes";

// ─── Reusable checkbox list ────────────────────────────────────────────────────
function CheckboxList({ options, selected, onToggle }) {
  return (
    <div className="space-y-3">
      {options.map(({ label, count }) => {
        const checked = selected.includes(label);
        return (
          <label key={label} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onToggle(label)}
              className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors
                ${checked ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-300"}`}
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm flex-1 leading-tight ${checked ? "text-blue-600 font-medium" : "text-gray-700"}`}>{label}</span>
            {count !== undefined && <span className="text-xs text-gray-400 flex-shrink-0">({count})</span>}
          </label>
        );
      })}
    </div>
  );
}

// ─── Single-window radio group ─────────────────────────────────────────────────
const SINGLE_WINDOW_OPTIONS = [
  { value: "seater",  label: "Single Window Seater" },
  { value: "sleeper", label: "Single Window Sleeper" },
  { value: "both",    label: "Both" },
];

function SingleWindowRadios() {
  const { filters, setSingleWindow } = useBookingStore();
  const current = filters.singleWindow;
  return (
    <div className="space-y-3">
      {SINGLE_WINDOW_OPTIONS.map(({ value, label }) => {
        const checked = current === value;
        return (
          <label key={value} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setSingleWindow(checked ? null : value)}
              className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors
                ${checked ? "border-blue-500 bg-blue-500" : "border-gray-300 group-hover:border-blue-300"}`}
            >
              {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <span className={`text-sm ${checked ? "text-blue-600 font-medium" : "text-gray-700"}`}>{label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Derived data from mockBuses ───────────────────────────────────────────────
const BUS_FEATURES = [
  { label: "Live Tracking",     count: mockBuses.filter((b) => b.hasLiveTracking).length },
  { label: "Free Cancellation", count: mockBuses.filter((b) => b.freeCancellation).length },
  { label: "Volvo",             count: mockBuses.filter((b) => b.isVolvo).length },
];

const OPERATORS = [...new Set(mockBuses.map((b) => b.operator))].map((op) => ({
  label: op,
  count: mockBuses.filter((b) => b.operator === op).length,
}));

const BOARDING_POINTS = [...new Set(mockBuses.map((b) => b.stops[0].name))].map((name) => ({
  label: name,
  count: mockBuses.filter((b) => b.stops[0].name === name).length,
}));

const DROPPING_POINTS = [...new Set(mockBuses.map((b) => b.stops[b.stops.length - 1].name))].map((name) => ({
  label: name,
  count: mockBuses.filter((b) => b.stops[b.stops.length - 1].name === name).length,
}));

const ALL_AMENITIES = [...new Set(mockBuses.flatMap((b) => b.amenities))].map((a) => ({
  label: a,
  count: mockBuses.filter((b) => b.amenities.includes(a)).length,
}));

// ─── Main FilterSidebar ────────────────────────────────────────────────────────
export default function FilterSidebar() {
  const {
    filters, clearAllFilters,
    toggleBusFeature, toggleOperator,
    toggleBoardingPoint, toggleDroppingPoint, toggleAmenity,
  } = useBookingStore();

  const hasActive =
    filters.quickFilters.length > 0 ||
    filters.departureSlots.length > 0 ||
    filters.arrivalSlots.length > 0 ||
    filters.busTypes.length > 0 ||
    filters.singleWindow !== null ||
    filters.busFeatures.length > 0 ||
    filters.operators.length > 0 ||
    filters.boardingPoints.length > 0 ||
    filters.droppingPoints.length > 0 ||
    filters.amenities.length > 0;

  const operatorSubtitle = filters.operators.length > 0
    ? `${filters.operators.length} selected`
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <h3 className="text-xl font-bold text-gray-900">Filter buses</h3>
        {hasActive && (
          <button type="button" onClick={clearAllFilters} className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Quick filter chips */}
      <QuickFilterChips />

      {/* Accordion: Departure time */}
      <AccordionFilter title="Departure time from source">
        <TimeSlotGrid type="departure" />
      </AccordionFilter>

      {/* Accordion: Arrival time */}
      <AccordionFilter title="Arrival time at destination">
        <TimeSlotGrid type="arrival" />
      </AccordionFilter>

      {/* Accordion: Bus type */}
      <AccordionFilter title="Bus type">
        <BusTypeCheckboxes />
      </AccordionFilter>

      {/* Accordion: Single window */}
      <AccordionFilter title="Single window seater/sleeper">
        <SingleWindowRadios />
      </AccordionFilter>

      {/* Accordion: Bus features */}
      <AccordionFilter title="Bus features">
        <CheckboxList options={BUS_FEATURES} selected={filters.busFeatures} onToggle={toggleBusFeature} />
      </AccordionFilter>

      {/* Accordion: Bus operator */}
      <AccordionFilter title="Bus operator" subtitle={operatorSubtitle}>
        <CheckboxList options={OPERATORS} selected={filters.operators} onToggle={toggleOperator} />
      </AccordionFilter>

      {/* Accordion: Boarding points */}
      <AccordionFilter title="Boarding points">
        <CheckboxList options={BOARDING_POINTS} selected={filters.boardingPoints} onToggle={toggleBoardingPoint} />
      </AccordionFilter>

      {/* Accordion: Dropping points */}
      <AccordionFilter title="Dropping points">
        <CheckboxList options={DROPPING_POINTS} selected={filters.droppingPoints} onToggle={toggleDroppingPoint} />
      </AccordionFilter>

      {/* Accordion: Amenities */}
      <AccordionFilter title="Amenities">
        <CheckboxList options={ALL_AMENITIES} selected={filters.amenities} onToggle={toggleAmenity} />
      </AccordionFilter>
    </div>
  );
}
