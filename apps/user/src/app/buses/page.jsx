"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import BusCard from "@/components/BusCard";
import ProgressStepper from "@/components/ProgressStepper";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ActiveFilterTags from "@/components/filters/ActiveFilterTags";
import useBookingStore from "@/store/bookingStore";
import { Suspense } from "react";

function BusSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-40">
          <div className="w-10 h-10 rounded-lg bg-gray-200 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="flex-1 flex gap-4 items-center">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="w-36 flex flex-col gap-2 items-end">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

const matchesBusType = (bus, typeLabel) => {
  switch (typeLabel) {
    case "Seater":         return bus.busType.includes("Seater");
    case "Sleeper":        return bus.isSleeper;
    case "AC Seater":      return bus.isAC && !bus.isSleeper;
    case "AC Sleeper":     return bus.isAC && bus.isSleeper;
    case "Non-AC Sleeper": return !bus.isAC && bus.isSleeper;
    case "Volvo":          return bus.isVolvo;
    default:               return false;
  }
};

function applyFilters(buses, filters) {
  let result = [...buses];
  const qf = filters.quickFilters;

  if (qf.includes("ac"))               result = result.filter((b) => b.isAC);
  if (qf.includes("sleeper"))          result = result.filter((b) => b.isSleeper);
  if (qf.includes("free_cancellation")) result = result.filter((b) => b.freeCancellation);
  if (qf.includes("live_tracking"))    result = result.filter((b) => b.hasLiveTracking);
  if (qf.includes("high_rated"))       result = result.filter((b) => b.rating >= 4.0);
  if (qf.includes("volvo"))            result = result.filter((b) => b.isVolvo);
  if (qf.includes("single_seats"))     result = result.filter((b) => b.isSingleWindow);
  if (qf.includes("evening"))          result = result.filter((b) => parseInt(b.departure) >= 18);

  if (filters.departureSlots.length > 0) {
    result = result.filter((b) => {
      const h = parseInt(b.departure.split(":")[0]);
      return filters.departureSlots.some((slot) => {
        if (slot === "before_6")  return h < 6;
        if (slot === "6_to_12")   return h >= 6 && h < 12;
        if (slot === "12_to_18")  return h >= 12 && h < 18;
        if (slot === "after_18")  return h >= 18;
        return false;
      });
    });
  }

  if (filters.arrivalSlots.length > 0) {
    result = result.filter((b) => {
      const h = parseInt(b.arrival.split(":")[0]);
      return filters.arrivalSlots.some((slot) => {
        if (slot === "before_6")  return h < 6;
        if (slot === "6_to_12")   return h >= 6 && h < 12;
        if (slot === "12_to_18")  return h >= 12 && h < 18;
        if (slot === "after_18")  return h >= 18;
        return false;
      });
    });
  }

  if (filters.busTypes.length > 0) {
    result = result.filter((b) => filters.busTypes.some((t) => matchesBusType(b, t)));
  }

  if (filters.singleWindow === "seater")  result = result.filter((b) => b.isSingleWindow && !b.isSleeper);
  if (filters.singleWindow === "sleeper") result = result.filter((b) => b.isSingleWindow && b.isSleeper);
  if (filters.singleWindow === "both")    result = result.filter((b) => b.isSingleWindow);

  if (filters.busFeatures.length > 0) {
    result = result.filter((b) =>
      filters.busFeatures.every((f) => {
        if (f === "Live Tracking")     return b.hasLiveTracking;
        if (f === "Free Cancellation") return b.freeCancellation;
        if (f === "Volvo")             return b.isVolvo;
        return true;
      })
    );
  }

  if (filters.operators.length > 0)
    result = result.filter((b) => filters.operators.includes(b.operator));

  if (filters.boardingPoints.length > 0)
    result = result.filter((b) => filters.boardingPoints.includes(b.stops[0].name));

  if (filters.droppingPoints.length > 0)
    result = result.filter((b) => filters.droppingPoints.includes(b.stops[b.stops.length - 1].name));

  if (filters.amenities.length > 0)
    result = result.filter((b) => filters.amenities.every((a) => b.amenities.includes(a)));

  return result;
}

function BusListingContent() {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to   = params.get("to")   || "";
  const date = params.get("date") || "";
  const { setSearchParams, filters, clearAllFilters } = useBookingStore();

  const [loading, setLoading]       = useState(true);
  const [buses, setBuses]           = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (from && to && date) setSearchParams({ from, to, date });
    if (!from || !to || !date) { setLoading(false); return; }
    setLoading(true);
    setFetchError(null);
    fetch(`/api/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((d) => { setBuses(d.buses || []); setLoading(false); })
      .catch(() => { setFetchError("Failed to load buses. Please try again."); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function hasDeparted(bus) {
    if (!date) return false;
    // Use local date (not UTC) so IST users get the correct calendar date
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const todayLocal = `${y}-${mo}-${d}`;
    if (date !== todayLocal) return false;
    const [h, m] = bus.departure.split(":").map(Number);
    return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
  }

  const filtered = useMemo(
    () => applyFilters(buses, filters).filter((bus) => !hasDeparted(bus)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buses, filters, date]
  );

  const activeCount =
    filters.quickFilters.length +
    filters.departureSlots.length +
    filters.arrivalSlots.length +
    filters.busTypes.length +
    (filters.singleWindow ? 1 : 0) +
    filters.busFeatures.length +
    filters.operators.length +
    filters.boardingPoints.length +
    filters.droppingPoints.length +
    filters.amenities.length;

  return (
    <div>
      <ProgressStepper currentStep={2} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <span>{from}</span>
              <ArrowRight size={20} className="text-blue-500" />
              <span>{to}</span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {date} · <span className="font-medium text-gray-600">{filtered.length} buses found</span>
            </p>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 sm:hidden bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl shadow-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Desktop filter sidebar */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Bus list */}
          <div className="flex-1 min-w-0">
            <ActiveFilterTags />
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <BusSkeleton key={i} />)
              ) : fetchError ? (
                <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
                  <p className="text-4xl mb-3">⚠️</p>
                  <p className="font-semibold text-gray-700">{fetchError}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-4xl mb-3">🚌</p>
                  <p className="font-semibold text-gray-700">No buses found for selected filters</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting or clearing your filters</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((bus) => <BusCard key={bus.id} bus={bus} journeyDate={date} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {drawerOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 py-2">
              <FilterSidebar />
            </div>

            {/* Sticky footer */}
            <div className="px-4 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-[2] py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply Filters ({filtered.length} buses)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <BusListingContent />
    </Suspense>
  );
}
