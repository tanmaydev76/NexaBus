"use client";
import { useRouter } from "next/navigation";
import { CheckCircle, Download, Home, Bus } from "lucide-react";
import useBookingStore from "@/store/bookingStore";

export default function BookingSuccessModal({ onClose }) {
  const router = useRouter();
  const { bookingId, selectedBus, selectedSeats, boardingPoint, droppingPoint, searchParams, passengerDetails } =
    useBookingStore();

  const baseFare = selectedBus ? selectedBus.price * selectedSeats.length : 0;
  const tax = Math.round(baseFare * 0.05);
  const total = baseFare + tax + 30;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Success header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-t-2xl p-8 text-center text-white">
          <div className="flex justify-center mb-3">
            <CheckCircle size={56} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-green-100 text-sm mt-1">Your ticket has been booked successfully</p>
          <div className="mt-4 bg-white/20 rounded-xl px-4 py-2 inline-block">
            <p className="text-xs text-green-100">Booking ID</p>
            <p className="text-xl font-bold tracking-wider">{bookingId}</p>
          </div>
        </div>

        {/* Ticket details */}
        <div className="p-6 space-y-4">
          {selectedBus && (
            <>
              {/* Route */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Bus size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedBus.operator}</p>
                  <p className="text-xs text-gray-500">{selectedBus.type}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {selectedBus.departure} → {selectedBus.arrival}
                  </p>
                  <p className="text-xs text-gray-500">{searchParams.date}</p>
                </div>
              </div>

              {/* Journey details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="font-semibold text-gray-800">{searchParams.from}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{boardingPoint}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <p className="font-semibold text-gray-800">{searchParams.to}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{droppingPoint}</p>
                </div>
              </div>

              {/* Seats */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Seats Booked</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="bg-green-100 text-green-800 font-semibold text-xs px-2 py-1 rounded-md border border-green-200"
                    >
                      {s.number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              {passengerDetails.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Passengers</p>
                  <div className="space-y-1">
                    {passengerDetails.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{p.name} ({p.gender}, {p.age})</span>
                        <span className="text-gray-400 text-xs">{p.seatNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fare */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Fare</span>
                  <span>₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>GST + Service Fee</span>
                  <span>₹{tax + 30}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base mt-2">
                  <span>Total Paid</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => alert("Downloading ticket... (UI only)")}
              className="flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-xl transition text-sm"
            >
              <Download size={16} />
              Download Ticket
            </button>
            <button
              onClick={() => {
                onClose();
                router.push("/");
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              <Home size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
