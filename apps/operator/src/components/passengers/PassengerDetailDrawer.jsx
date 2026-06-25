"use client";
import { X, Phone, MessageCircle, Copy, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const BOARDING_LABELS = { not_arrived: "Not Arrived", waiting: "Waiting", boarded: "Boarded", no_show: "No Show" };
const BOARDING_STYLES = {
  not_arrived: "border-slate-200 text-slate-600 hover:bg-slate-50",
  waiting:     "border-yellow-200 text-yellow-700 hover:bg-yellow-50",
  boarded:     "border-green-200 text-green-700 hover:bg-green-50",
  no_show:     "border-red-200 text-red-600 hover:bg-red-50",
};
const BOARDING_ACTIVE_STYLES = {
  not_arrived: "bg-slate-600 text-white border-slate-600",
  waiting:     "bg-yellow-500 text-white border-yellow-500",
  boarded:     "bg-green-600 text-white border-green-600",
  no_show:     "bg-red-600 text-white border-red-600",
};
const BOARDING_ORDER = ["not_arrived", "waiting", "boarded", "no_show"];

function digitsOnly(mobile) {
  return (mobile || "").replace(/\D/g, "");
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

export default function PassengerDetailDrawer({ passenger, onClose, onStatusChange, updating }) {
  const mobile = digitsOnly(passenger.mobile);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(passenger.mobile || "");
      toast.success("Phone number copied");
    } catch {
      toast.error("Could not copy phone number");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-96 sm:h-full max-h-[85vh] sm:max-h-full bg-white rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <span className="font-mono text-sm font-bold bg-brand/10 text-brand px-2.5 py-1.5 rounded-lg">
            {passenger.seatNumber}
          </span>
          <h3 className="font-semibold text-slate-800 text-base flex-1 truncate">{passenger.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Personal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Personal</h4>
            <DetailRow label="Age / Gender" value={`${passenger.age} / ${passenger.gender}`} />
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-slate-400">Mobile</span>
              <span className="flex items-center gap-2">
                <span className="text-slate-700 font-medium">{passenger.mobile || "—"}</span>
                {passenger.mobile && (
                  <button onClick={copyPhone} title="Copy phone" className="text-slate-400 hover:text-brand">
                    <Copy size={13} />
                  </button>
                )}
              </span>
            </div>
            <DetailRow label="Email" value={passenger.email || "—"} />
          </div>

          {/* Trip */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Trip</h4>
            <div className="flex items-center gap-2 text-sm py-1.5">
              <MapPin size={13} className="text-green-500 flex-shrink-0" />
              <span className="text-slate-700">{passenger.boardingPoint || "—"}</span>
              <span className="text-slate-400 ml-auto">{passenger.departure}</span>
            </div>
            <div className="flex items-center gap-2 text-sm py-1.5">
              <MapPin size={13} className="text-red-500 flex-shrink-0" />
              <span className="text-slate-700">{passenger.droppingPoint || "—"}</span>
              <span className="text-slate-400 ml-auto">{passenger.arrival}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Payment</h4>
            <DetailRow label="Base Fare" value={`₹${passenger.baseFare?.toLocaleString() ?? "—"}`} />
            <DetailRow label="Tax" value={`₹${passenger.tax?.toLocaleString() ?? 0}`} />
            <DetailRow label="Service Fee" value={`₹${passenger.serviceFee?.toLocaleString() ?? 0}`} />
            {passenger.discount > 0 && <DetailRow label="Discount" value={`-₹${passenger.discount.toLocaleString()}`} />}
            {passenger.couponCode && <DetailRow label="Coupon" value={passenger.couponCode} />}
            <DetailRow label="Booking Total" value={`₹${passenger.total?.toLocaleString() ?? "—"}`} />
          </div>

          {/* Boarding status */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Boarding Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {BOARDING_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={updating}
                  onClick={() => onStatusChange(passenger.bookingMongoId, s)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                    passenger.boardingStatus === s ? BOARDING_ACTIVE_STYLES[s] : BOARDING_STYLES[s]
                  }`}
                >
                  {BOARDING_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          {(passenger.specialNotes || passenger.luggageInfo) && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Notes</h4>
              {passenger.luggageInfo && <DetailRow label="Luggage" value={passenger.luggageInfo} />}
              {passenger.specialNotes && <DetailRow label="Special Notes" value={passenger.specialNotes} />}
            </div>
          )}

          {/* Booking */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Booking</h4>
            <DetailRow label="Booking ID" value={passenger.bookingId} />
            <DetailRow label="Status" value={<span className="capitalize">{passenger.bookingStatus}</span>} />
            <DetailRow label="Booked At" value={passenger.createdAt ? new Date(passenger.createdAt).toLocaleString() : "—"} />
          </div>
        </div>

        {/* Quick actions */}
        {mobile && (
          <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <a href={`tel:${mobile}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              <Phone size={15} /> Call
            </a>
            <a href={`https://wa.me/91${mobile}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
