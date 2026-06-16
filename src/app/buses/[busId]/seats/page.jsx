"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockBuses, generateSeatLayout } from "@/lib/mockData";
import SeatMap from "@/components/SeatMap";
import BookingSummary from "@/components/BookingSummary";
import ProgressStepper from "@/components/ProgressStepper";
import useBookingStore from "@/store/bookingStore";
import { ArrowLeft } from "lucide-react";

export default function SeatSelectionPage() {
  const { busId } = useParams();
  const router = useRouter();
  const { selectedBus, setSelectedBus, selectedSeats } = useBookingStore();
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    let bus = selectedBus;
    if (!bus || bus.id !== busId) {
      bus = mockBuses.find((b) => b.id === busId);
      if (bus) setSelectedBus(bus);
      else { router.push("/"); return; }
    }
    setLayout(generateSeatLayout(busId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busId]);

  if (!layout || !selectedBus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <ProgressStepper currentStep={3} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to buses
        </button>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{selectedBus.operator}</h1>
          <p className="text-sm text-gray-500">{selectedBus.type} · {selectedBus.departure} → {selectedBus.arrival}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Seat Map */}
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Select your seat{selectedSeats.length > 0 ? ` (${selectedSeats.length} selected)` : ""}
            </h2>
            <SeatMap layout={layout} busPrice={selectedBus?.price} />
          </div>

          {/* Booking Summary */}
          <div className="w-full lg:w-80">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
