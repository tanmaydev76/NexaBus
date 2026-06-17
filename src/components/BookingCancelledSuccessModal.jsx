"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function BookingCancelledSuccessModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(onClose, 2500);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-backdropIn">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs text-center px-8 py-9 animate-successIn"
      >
        {/* Animated SVG checkmark */}
        <div className="flex justify-center mb-5">
          <svg viewBox="0 0 52 52" className="w-16 h-16" fill="none">
            <circle
              cx="26"
              cy="26"
              r="23"
              stroke="#22c55e"
              strokeWidth="2.5"
              style={{
                strokeDasharray: 144,
                strokeDashoffset: 144,
                animation: "circleDraw 0.5s ease forwards",
              }}
            />
            <path
              d="M14 27l8 8 16-16"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 48,
                animation: "checkDraw 0.35s ease forwards 0.5s",
              }}
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Cancelled</h2>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          Your booking has been cancelled successfully.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold text-sm transition-colors"
        >
          Done
        </button>

        {/* Auto-close progress bar */}
        <div className="mt-4 h-0.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full"
            style={{ animation: "progressBar 2.5s linear forwards" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
