"use client";
import { useRouter } from "next/navigation";
import { Clock, Users, Wifi, Zap, Droplets, Wind, Star } from "lucide-react";
import useBookingStore from "@/store/bookingStore";

const amenityIcons = {
  WiFi: <Wifi size={13} />,
  "Charging Point": <Zap size={13} />,
  "Water Bottle": <Droplets size={13} />,
  Blanket: <Wind size={13} />,
};

export default function BusCard({ bus }) {
  const router = useRouter();
  const { setSelectedBus } = useBookingStore();

  const handleSelect = () => {
    setSelectedBus(bus);
    router.push(`/buses/${bus.id}/seats`);
  };

  const urgency = bus.availableSeats <= 10;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Operator */}
        <div className="sm:w-40 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm mb-1">
            {bus.operator.substring(0, 2).toUpperCase()}
          </div>
          <p className="font-semibold text-gray-800 text-sm leading-tight">{bus.operator}</p>
          <p className="text-xs text-gray-400 mt-0.5">{bus.type}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-600">{bus.rating}</span>
          </div>
        </div>

        {/* Timing */}
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{bus.departure}</p>
            <p className="text-xs text-gray-400">Departure</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-1">{bus.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-300" />
              <Clock size={12} className="text-gray-400" />
              <div className="flex-1 h-px bg-gray-300" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{bus.arrival}</p>
            <p className="text-xs text-gray-400">Arrival</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="sm:w-40 flex flex-wrap gap-1.5">
          {bus.amenities.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5"
            >
              {amenityIcons[a]}
              {a}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="sm:w-36 flex flex-col items-start sm:items-end gap-2">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-2xl font-bold text-gray-900">₹{bus.price}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className={urgency ? "text-orange-500" : "text-gray-400"} />
            <span className={`text-xs font-medium ${urgency ? "text-orange-500" : "text-gray-500"}`}>
              {bus.availableSeats} seats left
            </span>
          </div>
          <button
            onClick={handleSelect}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
}
