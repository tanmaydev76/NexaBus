"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { offers } from "@/lib/mockData";
import OfferCard from "./OfferCard";

export default function OffersDrawer({ isOpen, onClose, onApply }) {
  const busOffers = offers.filter((o) => o.category === "Bus");

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleApply = (code) => {
    onApply(code);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 backdrop-blur-sm bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — bottom sheet on mobile, right panel on desktop */}
      <div
        className={`fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh]
          lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-96 lg:rounded-none lg:rounded-l-2xl lg:max-h-full
          ${isOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-y-0 lg:translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">All Offers</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Cards */}
        <div className="overflow-y-auto h-full pb-16 lg:pb-6 px-5 py-4 space-y-4">
          {busOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onApply={handleApply} />
          ))}
        </div>
      </div>
    </>
  );
}
