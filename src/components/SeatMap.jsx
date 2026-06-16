"use client";
import { useState } from "react";
import useBookingStore from "@/store/bookingStore";

// ─── Icons ────────────────────────────────────────────────────────────────────

const PersonIcon = ({ isFemale }) => (
  <svg width="26" height="38" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13" cy="9" r="7" fill={isFemale ? "#f9a8d4" : "#bfdbfe"} />
    <path d="M1 36 C1 23 25 23 25 36" fill={isFemale ? "#f9a8d4" : "#bfdbfe"} />
  </svg>
);

const SteeringWheelIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="15" stroke="#d1d5db" strokeWidth="3" />
    <circle cx="18" cy="18" r="4.5" stroke="#d1d5db" strokeWidth="2.5" fill="white" />
    <line x1="18" y1="13.5" x2="18" y2="3" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="14" y1="21.5" x2="5" y2="27" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="22" y1="21.5" x2="31" y2="27" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ─── SLEEPER Berth Cell ────────────────────────────────────────────────────────

function SleeperBerth({ seat, selectedSeats, onToggle, price }) {
  if (!seat) {
    return <div className="w-6 flex-shrink-0" />;
  }

  const isSelected = selectedSeats.some((s) => s.id === seat.id);
  const isBooked = seat.status === "booked";
  const isFemale = seat.isFemaleOnly;

  let berthCls =
    "relative w-[60px] h-[104px] rounded-2xl border-2 flex flex-col items-center justify-between py-2 px-1.5 flex-shrink-0 transition-all duration-150 ";

  if (isBooked) {
    berthCls += isFemale
      ? "bg-[#FFF0F8] border-pink-200 cursor-not-allowed"
      : "bg-[#EEF2FF] border-[#c7d2fe] cursor-not-allowed";
  } else if (isSelected) {
    berthCls += "bg-green-50 border-green-500 cursor-pointer shadow-md ring-1 ring-green-300";
  } else if (isFemale) {
    berthCls += "bg-white border-pink-300 cursor-pointer hover:bg-pink-50";
  } else {
    berthCls += "bg-white border-green-500 cursor-pointer hover:bg-green-50";
  }

  return (
    <div
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
      onClick={() => !isBooked && onToggle(seat)}
    >
      <div className={berthCls}>
        {isBooked ? (
          <div className="flex-1 flex items-center justify-center">
            <PersonIcon isFemale={isFemale} />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {/* Bottom colour bar */}
        <div
          className={`w-9 h-1.5 rounded-full ${
            isBooked
              ? "opacity-0"
              : isSelected
              ? "bg-green-500"
              : isFemale
              ? "bg-pink-300"
              : "bg-green-400"
          }`}
        />
      </div>
      <span
        className={`text-[11px] font-semibold ${
          isBooked ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {isBooked ? "Sold" : `₹${price}`}
      </span>
    </div>
  );
}

// ─── SLEEPER Deck Grid ─────────────────────────────────────────────────────────

function SleeperDeckGrid({ rows, selectedSeats, onToggle, label, price }) {
  return (
    <div className="bg-[#F5F5FA] rounded-3xl p-5 inline-block min-w-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-800">{label}</h3>
        <SteeringWheelIcon />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-end gap-2">
            {row.map((seat, colIdx) => (
              <SleeperBerth
                key={colIdx}
                seat={seat}
                selectedSeats={selectedSeats}
                onToggle={onToggle}
                price={price}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEATER Seat Cell (original square design) ─────────────────────────────────

function SeaterSeatCell({ seat, selectedSeats, onToggle }) {
  if (!seat) return <div className="w-9 h-9" />;

  const isSelected = selectedSeats.some((s) => s.id === seat.id);
  const isBooked = seat.status === "booked";

  let cls =
    "w-9 h-9 rounded-t-lg text-xs font-semibold flex items-center justify-center cursor-pointer border-2 transition-all relative ";
  if (isBooked)
    cls += "bg-red-100 border-red-400 text-red-400 cursor-not-allowed";
  else if (isSelected)
    cls += "bg-yellow-400 border-yellow-500 text-yellow-900";
  else if (seat.isFemaleOnly)
    cls += "bg-pink-50 border-pink-400 text-pink-600 hover:bg-pink-100";
  else
    cls += "bg-white border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400";

  return (
    <div
      className={cls}
      onClick={() => !isBooked && onToggle(seat)}
      title={`${seat.number}${seat.isFemaleOnly ? " (Female only)" : ""}${
        isBooked ? " (Booked)" : ""
      }`}
    >
      {seat.number.replace("S", "")}
      {seat.isFemaleOnly && !isBooked && (
        <span className="absolute -top-1 -right-1 text-pink-500 text-[8px]">♀</span>
      )}
    </div>
  );
}

function SeaterDeckGrid({ rows, selectedSeats, onToggle }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5 mb-2 pl-6">
        {["W", "A", "", "A", "W"].map((lbl, i) => (
          <div key={i} className="w-9 text-center text-[10px] text-gray-400 font-medium">
            {lbl}
          </div>
        ))}
      </div>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1.5 items-center">
          <div className="w-5 text-[10px] text-gray-400 text-center">{rowIdx + 1}</div>
          {row.map((seat, colIdx) => (
            <SeaterSeatCell
              key={colIdx}
              seat={seat}
              selectedSeats={selectedSeats}
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main SeatMap Component ────────────────────────────────────────────────────

export default function SeatMap({ layout, busPrice = 800 }) {
  const { selectedSeats, toggleSeat } = useBookingStore();
  const [activeTab, setActiveTab] = useState("lower");

  const isSleeperLayout = layout?.type === "sleeper";

  if (!layout) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Deck switcher (sleeper only) */}
      {isSleeperLayout && (
        <div className="flex gap-2 mb-5">
          {["lower", "upper"].map((deck) => (
            <button
              key={deck}
              onClick={() => setActiveTab(deck)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === deck
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {deck.charAt(0).toUpperCase() + deck.slice(1)} Deck
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs text-gray-600">
        {isSleeperLayout ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-6 rounded-lg bg-white border-2 border-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-6 rounded-lg bg-green-50 border-2 border-green-500" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-6 rounded-lg bg-[#EEF2FF] border-2 border-[#c7d2fe]" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-6 rounded-lg bg-[#FFF0F8] border-2 border-pink-200" />
              <span>Ladies Only</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-white border-2 border-gray-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-yellow-400 border-2 border-yellow-500" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-red-100 border-2 border-red-400" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-pink-50 border-2 border-pink-400" />
              <span>Female Only</span>
            </div>
          </>
        )}
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto">
        {isSleeperLayout ? (
          activeTab === "lower" ? (
            <SleeperDeckGrid
              rows={layout.lower}
              selectedSeats={selectedSeats}
              onToggle={toggleSeat}
              label="Lower deck"
              price={busPrice}
            />
          ) : (
            <SleeperDeckGrid
              rows={layout.upper}
              selectedSeats={selectedSeats}
              onToggle={toggleSeat}
              label="Upper deck"
              price={busPrice}
            />
          )
        ) : (
          <>
            <div className="flex justify-end mb-3">
              <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200">
                Driver
              </div>
            </div>
            <SeaterDeckGrid
              rows={layout.lower}
              selectedSeats={selectedSeats}
              onToggle={toggleSeat}
            />
          </>
        )}
      </div>

      {selectedSeats.length >= 6 && (
        <p className="mt-4 text-xs text-orange-500 font-medium">
          Maximum 6 seats can be selected per booking.
        </p>
      )}
    </div>
  );
}
