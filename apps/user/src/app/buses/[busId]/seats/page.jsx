"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import BookingSummary from "@/components/BookingSummary";
import ProgressStepper from "@/components/ProgressStepper";
import useBookingStore from "@/store/bookingStore";
import { ArrowLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function SeatSelectionPage() {
  const { busId } = useParams();
  const router = useRouter();
  const { selectedBus, selectedSeats, boardingPoint, droppingPoint } = useBookingStore();
  const [layout, setLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(true);

  useEffect(() => {
    if (!selectedBus || selectedBus.id !== busId) {
      router.push("/");
      return;
    }
    setLayoutLoading(true);
    fetch(`/api/trips/${busId}/seats`)
      .then((r) => r.json())
      .then((d) => {
        if (d.layout) setLayout(d.layout);
        else toast.error("Could not load seat map.");
      })
      .catch(() => toast.error("Could not load seat map."))
      .finally(() => setLayoutLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busId]);

  if (!selectedBus || layoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Seat map unavailable.
      </div>
    );
  }

  const handleMobileProceed = () => {
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

  const total = selectedBus.price * selectedSeats.length;

  return (
    <div className="pb-24 lg:pb-0">
      <ProgressStepper currentStep={3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-5"
        >
          <ArrowLeft size={16} />
          Back to buses
        </button>

        <div className="mb-5">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{selectedBus.operator}</h1>
          <p className="text-sm text-gray-500">{selectedBus.type} · {selectedBus.departure} → {selectedBus.arrival}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Select your seat{selectedSeats.length > 0 ? ` (${selectedSeats.length} selected)` : ""}
            </h2>
            <SeatMap layout={layout} busPrice={selectedBus?.price} />
          </div>

          <div className="hidden lg:block w-80 flex-shrink-0">
            <BookingSummary />
          </div>

          <div className="lg:hidden">
            <BookingSummary />
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            {selectedSeats.length > 0 ? (
              <>
                <p className="text-xs text-gray-400">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} · {selectedSeats.map(s => s.number).join(", ")}</p>
                <p className="text-lg font-black text-gray-900">₹{total}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 font-medium">No seats selected</p>
            )}
          </div>
          <button
            onClick={handleMobileProceed}
            disabled={!selectedSeats.length}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors flex-shrink-0"
          >
            Proceed <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
