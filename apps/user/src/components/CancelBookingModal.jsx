"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, Calendar, Clock } from "lucide-react";

export default function CancelBookingModal({ booking, onClose, onConfirm, isCancelling }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isCancelling) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, isCancelling]);

  function handleBackdrop(e) {
    if (e.target === backdropRef.current && !isCancelling) onClose();
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-backdropIn"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-modalIn"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <h2 id="cancel-modal-title" className="text-lg font-bold text-gray-900">
              Cancel Booking?
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone.</p>
          </div>
          {!isCancelling && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0 ml-3"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Booking summary card */}
        <div className="mx-5 mb-5 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-base">
            <span>{booking.from}</span>
            <ArrowRight size={14} className="text-blue-500 flex-shrink-0" />
            <span>{booking.to}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              {booking.date}
            </span>
            {booking.departure && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                {booking.departure}
              </span>
            )}
          </div>

          {booking.seats?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {booking.seats.map((s, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 font-semibold text-xs px-2 py-0.5 rounded-md"
                >
                  {s.number}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-400 font-medium">Amount paid</span>
            <span className="text-base font-bold text-gray-900">₹{booking.total}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-70 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isCancelling ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Booking"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
