"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ChevronDown, Check } from "lucide-react";
import useBookingStore from "@/store/bookingStore";
import toast from "react-hot-toast";

// ─── Custom stop dropdown (replaces native <select> for a themed look) ────────
function StopDropdown({ value, onChange, options, pinColor }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((s) => s.name === value);
  const pinClass = pinColor === "red" ? "text-red-500" : "text-blue-500";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 pl-3 pr-3 py-2 border rounded-lg text-sm bg-gray-50 transition-colors ${
          open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <MapPin size={14} className={`flex-shrink-0 ${pinClass}`} />
        <span className={`flex-1 text-left truncate ${selected ? "text-gray-700" : "text-gray-400"}`}>
          {selected ? `${selected.name}${selected.time ? ` (${selected.time})` : ""}` : "Select stop"}
        </span>
        <ChevronDown size={14} className={`flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-gray-100 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] overflow-hidden">
          <ul className="max-h-52 overflow-y-auto py-1">
            {options.map((s) => (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => { onChange(s.name); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 text-left px-3.5 py-2.5 text-sm transition-colors ${
                    value === s.name ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{s.name}{s.time ? ` (${s.time})` : ""}</span>
                  {value === s.name && <Check size={14} className="flex-shrink-0" />}
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-3.5 py-4 text-center text-sm text-gray-400">No stops available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BookingSummary() {
  const router = useRouter();
  const {
    selectedBus,
    selectedSeats,
    boardingPoint,
    droppingPoint,
    setBoardingPoint,
    setDroppingPoint,
    searchParams,
  } = useBookingStore();

  if (!selectedBus) return null;

  const baseFare = selectedBus.price * selectedSeats.length;
  const tax = Math.round(baseFare * 0.05);
  const serviceFee = selectedSeats.length > 0 ? 30 : 0;
  const total = baseFare + tax + serviceFee;

  const handleProceed = () => {
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat.");
      return;
    }
    if (!boardingPoint) {
      toast.error("Please select a boarding point.");
      return;
    }
    if (!droppingPoint) {
      toast.error("Please select a dropping point.");
      return;
    }
    router.push("/booking/confirm");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 sticky top-24">
      <h3 className="font-semibold text-gray-800 text-base">Booking Summary</h3>

      {/* Bus info */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="font-semibold text-blue-800 text-sm">{selectedBus.operator}</p>
        <p className="text-xs text-blue-600 mt-0.5">{selectedBus.type}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-blue-800 font-medium">
          <span>{selectedBus.departure}</span>
          <ChevronRight size={14} />
          <span>{selectedBus.arrival}</span>
        </div>
        {searchParams.date && (
          <p className="text-xs text-blue-600 mt-1">{searchParams.date}</p>
        )}
      </div>

      {/* Selected seats */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">SELECTED SEATS</p>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No seats selected</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-md border border-yellow-300"
              >
                {s.number}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Boarding point */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">BOARDING POINT</label>
        <StopDropdown
          value={boardingPoint}
          onChange={setBoardingPoint}
          options={selectedBus.boardingPoints?.length ? selectedBus.boardingPoints : selectedBus.stops}
          pinColor="blue"
        />
      </div>

      {/* Dropping point */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">DROPPING POINT</label>
        <StopDropdown
          value={droppingPoint}
          onChange={setDroppingPoint}
          options={selectedBus.droppingPoints?.length ? selectedBus.droppingPoints : selectedBus.stops}
          pinColor="red"
        />
      </div>

      {/* Fare breakdown */}
      {selectedSeats.length > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              ₹{selectedBus.price} × {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
            </span>
            <span>₹{baseFare}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>GST (5%)</span>
            <span>₹{tax}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Service fee</span>
            <span>₹{serviceFee}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleProceed}
        disabled={!selectedSeats.length}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm"
      >
        Proceed to Book
      </button>
    </div>
  );
}
