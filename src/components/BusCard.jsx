"use client";
import { useRouter } from "next/navigation";
import { Clock, Users, Wifi, Zap, Droplets, Wind, Star, AlertCircle } from "lucide-react";
import useBookingStore from "@/store/bookingStore";

const amenityIcons = {
  WiFi: <Wifi size={13} />,
  "Charging Point": <Zap size={13} />,
  "Water Bottle": <Droplets size={13} />,
  Blanket: <Wind size={13} />,
};

function isDeparted(journeyDate, departureTime) {
  if (!journeyDate || !departureTime) return false;
  const todayStr = new Date().toISOString().split("T")[0];
  if (journeyDate !== todayStr) return false;
  const now = new Date();
  const [h, m] = departureTime.split(":").map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
}

export default function BusCard({ bus, journeyDate }) {
  const router = useRouter();
  const { setSelectedBus } = useBookingStore();

  const departed = isDeparted(journeyDate, bus.departure);

  const handleSelect = () => {
    setSelectedBus(bus);
    router.push(`/buses/${bus.id}/seats`);
  };

  const urgency = !departed && bus.availableSeats <= 10;

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-shadow p-5 ${departed ? "border-gray-200 opacity-60" : "border-gray-200 hover:shadow-md"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Operator */}
        <div className="sm:w-40 flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm mb-1 ${departed ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-700"}`}>
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
            <p className={`text-xl font-bold ${departed ? "text-gray-400" : "text-gray-900"}`}>{bus.departure}</p>
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
            <p className={`text-xl font-bold ${departed ? "text-gray-400" : "text-gray-900"}`}>{bus.arrival}</p>
            <p className="text-xs text-gray-400">Arrival</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="sm:w-40 flex flex-wrap gap-1.5">
          {bus.amenities.map((a) => (
            <span key={a} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
              {amenityIcons[a]}
              {a}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="sm:w-36 flex flex-col items-start sm:items-end gap-2">
          {departed ? (
            <>
              <div className="flex items-center gap-1.5 text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="text-xs font-bold">Departed</span>
              </div>
              <p className="text-xs text-gray-400">This bus has already left</p>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
