"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Building2 } from "lucide-react";
import { governmentBuses } from "@/lib/mockData";
import GovBusCard from "./GovBusCard";

export default function GovernmentBusesSection() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={20} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Government Buses</h2>
          </div>
          <p className="text-sm text-gray-500">Book official government bus tickets online</p>
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        )}

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {governmentBuses.map((op) => (
            <GovBusCard key={op.id} operator={op} />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        )}
      </div>
    </section>
  );
}
