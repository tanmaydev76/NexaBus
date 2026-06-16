"use client";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";
import useBookingStore from "@/store/bookingStore";
import toast from "react-hot-toast";

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
        <div className="relative">
          <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-500" />
          <select
            value={boardingPoint}
            onChange={(e) => setBoardingPoint(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select stop</option>
            {selectedBus.stops.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.time})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dropping point */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">DROPPING POINT</label>
        <div className="relative">
          <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-500" />
          <select
            value={droppingPoint}
            onChange={(e) => setDroppingPoint(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select stop</option>
            {selectedBus.stops.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.time})
              </option>
            ))}
          </select>
        </div>
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
