"use client";
import { useState } from "react";
import useBookingStore from "@/store/bookingStore";

// ─── Shared person silhouette ──────────────────────────────────────────────────
const PersonSilhouette = ({ color, size = 18 }) => (
  <svg width={size} height={Math.round(size * 1.25)} viewBox="0 0 20 25" fill="none">
    <circle cx="10" cy="7" r="5.5" fill={color} />
    <path d="M1 24 C1 15 19 15 19 24" fill={color} />
  </svg>
);

// ─── Steering wheel ───────────────────────────────────────────────────────────
const SteeringWheelIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="15" stroke="#d1d5db" strokeWidth="3" />
    <circle cx="18" cy="18" r="4.5" stroke="#d1d5db" strokeWidth="2.5" fill="white" />
    <line x1="18" y1="13.5" x2="18" y2="3" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="14" y1="21.5" x2="5" y2="27" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="21.5" x2="31" y2="27" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ─── SEATER seat cell ──────────────────────────────────────────────────────────
function SeaterSeatCell({ seat, selectedSeats, onToggle }) {
  if (!seat) return <div className="w-11 h-12" />;

  const isSelected = selectedSeats.some((s) => s.id === seat.id);
  const isBooked   = seat.status === "booked";
  const isFemale   = seat.isFemaleOnly;

  // ── colour tokens ──
  let border, bg, pillowBg, personColor, showPerson;

  if (isBooked) {
    if (isFemale) {
      border = "border-pink-200";   bg = "bg-pink-50";
      pillowBg = "bg-pink-200";     personColor = "#f9a8d4"; showPerson = true;
    } else {
      border = "border-gray-200";   bg = "bg-gray-100";
      pillowBg = "bg-gray-300";     personColor = "#9ca3af"; showPerson = true;
    }
  } else if (isSelected) {
    border = "border-green-700";    bg = "bg-green-700";
    pillowBg = "bg-green-900";      personColor = null; showPerson = false;
  } else if (isFemale) {
    border = "border-pink-500";     bg = "bg-pink-50";
    pillowBg = "bg-pink-400";       personColor = "#ec4899"; showPerson = true;
  } else {
    border = "border-green-500";    bg = "bg-white";
    pillowBg = "bg-green-500";      personColor = null; showPerson = false;
  }

  const opacity = isBooked ? "opacity-70" : "opacity-100";

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => !isBooked && onToggle(seat)}
      title={`${seat.number}${isFemale ? " (Female only)" : ""}${isBooked ? " (Booked)" : ""}`}
      className={`flex flex-col items-center gap-1 group ${isBooked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* Seat body */}
      <div className={`relative w-11 h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 ${border} ${bg} ${opacity} ${!isBooked && !isSelected ? "group-hover:scale-105 group-hover:shadow-md" : ""} ${isSelected ? "shadow-lg scale-105" : ""}`}>
        {/* Content inside seat */}
        {showPerson && <PersonSilhouette color={personColor} size={20} />}
        {/* Pillow bar at bottom */}
        <div className={`absolute bottom-1.5 w-7 h-1.5 rounded-full ${pillowBg} ${isBooked && !isFemale ? "opacity-60" : ""}`} />
      </div>
      {/* Seat number below */}
      <span className={`text-[10px] font-semibold leading-none ${isBooked ? "text-gray-400" : isSelected ? "text-green-700" : isFemale ? "text-pink-500" : "text-gray-500"}`}>
        {seat.number.replace("S", "")}
      </span>
    </button>
  );
}

// ─── SEATER deck grid ──────────────────────────────────────────────────────────
function SeaterDeckGrid({ rows, selectedSeats, onToggle }) {
  return (
    <div className="space-y-2">
      {/* Column labels */}
      <div className="flex gap-2 mb-1 pl-7">
        {["W", "A", "", "A", "W"].map((lbl, i) => (
          <div key={i} className="w-11 text-center text-[10px] text-gray-400 font-semibold">{lbl}</div>
        ))}
      </div>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-2 items-center">
          <div className="w-5 text-[10px] text-gray-400 text-center font-medium">{rowIdx + 1}</div>
          {row.map((seat, colIdx) => (
            <SeaterSeatCell key={colIdx} seat={seat} selectedSeats={selectedSeats} onToggle={onToggle} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SLEEPER berth cell ───────────────────────────────────────────────────────
function SleeperBerth({ seat, selectedSeats, onToggle, price }) {
  if (!seat) return <div className="w-14 flex-shrink-0" />;

  const isSelected = selectedSeats.some((s) => s.id === seat.id);
  const isBooked   = seat.status === "booked";
  const isFemale   = seat.isFemaleOnly;

  // ── colour tokens ──
  let containerCls, pillowCls, personColor, showPerson;

  if (isBooked) {
    if (isFemale) {
      containerCls = "bg-pink-50 border-pink-200";
      pillowCls    = "bg-pink-200";
      personColor  = "#f9a8d4"; showPerson = true;
    } else {
      containerCls = "bg-gray-100 border-gray-200";
      pillowCls    = "bg-gray-300";
      personColor  = "#9ca3af"; showPerson = true;
    }
  } else if (isSelected) {
    containerCls = "bg-green-700 border-green-800";
    pillowCls    = "bg-green-900";
    personColor  = null; showPerson = false;
  } else if (isFemale) {
    containerCls = "bg-pink-50 border-pink-500";
    pillowCls    = "bg-pink-500";
    personColor  = "#ec4899"; showPerson = true;
  } else {
    containerCls = "bg-white border-green-500";
    pillowCls    = "bg-green-500";
    personColor  = null; showPerson = false;
  }

  const opacity = isBooked ? "opacity-60" : "opacity-100";

  return (
    <div
      className={`flex flex-col items-center gap-1.5 flex-shrink-0 ${isBooked ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={() => !isBooked && onToggle(seat)}
    >
      <div className={`relative w-14 h-[104px] rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-150 ${containerCls} ${opacity} ${!isBooked && !isSelected ? "hover:scale-105 hover:shadow-md" : ""} ${isSelected ? "shadow-lg scale-105" : ""}`}>
        {/* Person silhouette */}
        {showPerson && (
          <PersonSilhouette color={personColor} size={24} />
        )}
        {/* Pillow bar at bottom */}
        <div className={`absolute bottom-2.5 w-9 h-2 rounded-full ${pillowCls} ${isBooked ? "opacity-70" : ""}`} />
      </div>
      <span className={`text-[11px] font-semibold leading-none ${isBooked ? "text-gray-400" : isSelected ? "text-green-700" : isFemale ? "text-pink-500" : "text-gray-600"}`}>
        {isBooked ? "Sold" : `₹${price}`}
      </span>
    </div>
  );
}

// ─── SLEEPER deck grid ────────────────────────────────────────────────────────
function SleeperDeckGrid({ rows, selectedSeats, onToggle, label, price, showSteeringWheel }) {
  return (
    <div className="bg-[#F5F5FA] rounded-3xl p-5 inline-block min-w-[200px] flex-shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-700">{label}</h3>
        {showSteeringWheel && <SteeringWheelIcon />}
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-end gap-2">
            {row.map((seat, colIdx) => (
              <SleeperBerth key={colIdx} seat={seat} selectedSeats={selectedSeats} onToggle={onToggle} price={price} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Legend item ───────────────────────────────────────────────────────────────
function LegendItem({ label, seaterEl, sleeperEl }) {
  return (
    <div className="flex items-center gap-8">
      <span className="text-xs text-gray-500 w-40 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-6">
        <div className="flex items-center justify-center w-11">{seaterEl}</div>
        <div className="flex items-center justify-center w-14">{sleeperEl}</div>
      </div>
    </div>
  );
}

// ─── Main SeatMap Component ────────────────────────────────────────────────────
export default function SeatMap({ layout, busPrice = 800 }) {
  const { selectedSeats, toggleSeat } = useBookingStore();
  const [showLegend, setShowLegend] = useState(false);

  const isSleeperLayout = layout?.type === "sleeper";
  if (!layout) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      {/* Collapsible legend */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setShowLegend((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {showLegend ? "Hide seat legend" : "View seat legend"}
        </button>

        {showLegend && (
          <div className="border border-gray-100 rounded-xl overflow-hidden text-sm">
            {/* Header */}
            <div className="flex items-center gap-8 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 w-40 flex-shrink-0">Seat Types</span>
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-gray-500 w-11 text-center">Seater</span>
                <span className="text-xs font-bold text-gray-500 w-14 text-center">Sleeper</span>
              </div>
            </div>

            {/* Rows */}
            {[
              {
                label: "Available",
                seater: <div className="w-10 h-11 rounded-xl border-2 border-green-500 bg-white flex items-end justify-center pb-1.5"><div className="w-6 h-1.5 rounded-full bg-green-500" /></div>,
                sleeper: <div className="w-12 h-[72px] rounded-2xl border-2 border-green-500 bg-white flex items-end justify-center pb-2"><div className="w-8 h-1.5 rounded-full bg-green-500" /></div>,
              },
              {
                label: "Available — female only",
                seater: <div className="w-10 h-11 rounded-xl border-2 border-pink-500 bg-pink-50 flex flex-col items-center justify-center gap-0.5 pb-1"><PersonSilhouette color="#ec4899" size={16} /><div className="w-6 h-1 rounded-full bg-pink-400 mt-0.5" /></div>,
                sleeper: <div className="w-12 h-[72px] rounded-2xl border-2 border-pink-500 bg-pink-50 flex flex-col items-center justify-center"><PersonSilhouette color="#ec4899" size={20} /><div className="w-8 h-1.5 rounded-full bg-pink-500 mt-1.5" /></div>,
              },
              {
                label: "Selected by you",
                seater: <div className="w-10 h-11 rounded-xl border-2 border-green-700 bg-green-700 flex items-end justify-center pb-1.5"><div className="w-6 h-1.5 rounded-full bg-green-900" /></div>,
                sleeper: <div className="w-12 h-[72px] rounded-2xl border-2 border-green-700 bg-green-700 flex items-end justify-center pb-2"><div className="w-8 h-1.5 rounded-full bg-green-900" /></div>,
              },
              {
                label: "Already booked",
                seater: <div className="w-10 h-11 rounded-xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center"><PersonSilhouette color="#9ca3af" size={16} /></div>,
                sleeper: <div className="w-12 h-[72px] rounded-2xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center"><PersonSilhouette color="#9ca3af" size={20} /></div>,
              },
              {
                label: "Booked — female passenger",
                seater: <div className="w-10 h-11 rounded-xl border-2 border-pink-200 bg-pink-50 opacity-70 flex flex-col items-center justify-center gap-0.5 pb-1"><PersonSilhouette color="#f9a8d4" size={16} /><div className="w-6 h-1 rounded-full bg-pink-200 mt-0.5" /></div>,
                sleeper: <div className="w-12 h-[72px] rounded-2xl border-2 border-pink-200 bg-pink-50 opacity-70 flex flex-col items-center justify-center"><PersonSilhouette color="#f9a8d4" size={20} /></div>,
              },
            ].map(({ label, seater, sleeper }) => (
              <div key={label} className="flex items-center gap-8 px-4 py-3.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-600 w-40 flex-shrink-0">{label}</span>
                <div className="flex items-center gap-6">
                  <div className="w-11 flex justify-center">{seater}</div>
                  <div className="w-14 flex justify-center">{sleeper}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto">
        {isSleeperLayout ? (
          <div className="flex gap-5 items-start">
            <SleeperDeckGrid rows={layout.lower} selectedSeats={selectedSeats} onToggle={toggleSeat} label="Lower deck" price={busPrice} showSteeringWheel />
            <SleeperDeckGrid rows={layout.upper} selectedSeats={selectedSeats} onToggle={toggleSeat} label="Upper deck" price={busPrice} />
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-3">
              <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200">Driver</div>
            </div>
            <SeaterDeckGrid rows={layout.lower} selectedSeats={selectedSeats} onToggle={toggleSeat} />
          </>
        )}
      </div>

      {selectedSeats.length >= 6 && (
        <p className="mt-4 text-xs text-orange-500 font-medium">Maximum 6 seats can be selected per booking.</p>
      )}
    </div>
  );
}
