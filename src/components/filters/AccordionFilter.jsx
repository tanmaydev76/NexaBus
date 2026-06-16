"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionFilter({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-t border-gray-200 transition-all ${open ? "border-l-4 border-l-blue-500" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-start justify-between py-4 pr-2 transition-all ${open ? "pl-3" : "pl-0"}`}
      >
        <div className="text-left">
          <span className={`font-bold text-sm block ${open ? "text-blue-600" : "text-gray-800"}`}>{title}</span>
          {subtitle && <span className="text-xs text-gray-400 mt-0.5 block">{subtitle}</span>}
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${open ? "max-h-[400px] pb-4" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
}
