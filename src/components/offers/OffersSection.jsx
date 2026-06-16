"use client";
import { useRef, useState } from "react";
import { offers } from "@/lib/mockData";
import OfferCard from "./OfferCard";

const TABS = ["All", "Bus", "Festival", "Weekend"];

export default function OffersSection() {
  const [activeTab, setActiveTab] = useState("All");
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const filtered = activeTab === "All" ? offers : offers.filter((o) => o.category === activeTab);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const stopDrag = () => { isDragging.current = false; };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Offers for you</h2>
        <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 text-sm font-medium underline underline-offset-2 hover:text-blue-700">
          View more
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeTab === tab
                ? "bg-[#FF6B6B] text-white border-[#FF6B6B]"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable cards row */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filtered.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm py-8">No offers in this category.</p>
        )}
      </div>
    </section>
  );
}
