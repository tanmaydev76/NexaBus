"use client";
import { useState, useEffect } from "react";
import { User, Users } from "lucide-react";
import useBookingStore from "@/store/bookingStore";
import { useAuth } from "@/context/AuthContext";

function PassengerField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function getAvatarColor(gender) {
  if (gender === "Female") return "bg-pink-100 text-pink-600";
  if (gender === "Other") return "bg-purple-100 text-purple-600";
  return "bg-blue-100 text-blue-600";
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PassengerForm({ onValidated, isBooking = false }) {
  const { selectedSeats, setPassengerDetails } = useBookingStore();
  const { user } = useAuth();

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatId: seat.id,
      seatNumber: seat.number,
      name: "",
      age: "",
      gender: "",
      mobile: "",
      email: "",
      savedTravellerId: null,
      saveTraveller: false,
    }))
  );
  const [errors, setErrors] = useState(selectedSeats.map(() => ({})));
  const [savedTravellers, setSavedTravellers] = useState([]);
  // For multi-passenger: which chip was tapped, waiting for slot selection
  const [pendingTraveller, setPendingTraveller] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/travellers")
      .then((r) => r.json())
      .then((data) => {
        const list = data.travellers || [];
        setSavedTravellers(list);
        // Auto-fill first passenger with primary traveller
        if (list.length > 0 && passengers.length > 0 && !passengers[0].name) {
          const primary = list.find((t) => t.isPrimary);
          if (primary) fillSlot(0, primary);
        }
      })
      .catch(() => {});
  }, [user]);

  function fillSlot(idx, traveller) {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        name: traveller.fullName,
        age: String(traveller.age),
        gender: traveller.gender,
        mobile: traveller.mobileNumber,
        email: traveller.emailAddress || "",
        savedTravellerId: String(traveller._id),
        saveTraveller: false,
      };
      return next;
    });
    setErrors((prev) => {
      const next = [...prev];
      next[idx] = {};
      return next;
    });
    setPendingTraveller(null);
  }

  function handleChipClick(traveller) {
    if (passengers.length === 1) {
      fillSlot(0, traveller);
      return;
    }
    // Multi-passenger: if same chip tapped again, cancel
    if (pendingTraveller?._id === traveller._id) {
      setPendingTraveller(null);
      return;
    }
    setPendingTraveller(traveller);
  }

  const update = (idx, field, value) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (["name", "mobile", "email", "age", "gender"].includes(field)) {
        next[idx].savedTravellerId = null;
      }
      return next;
    });
    setErrors((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: "" };
      return next;
    });
  };

  const validate = () => {
    let valid = true;
    const newErrors = passengers.map((p) => {
      const e = {};
      if (!p.name.trim()) { e.name = "Required"; valid = false; }
      if (!p.age || isNaN(p.age) || p.age < 1 || p.age > 120) { e.age = "Valid age required"; valid = false; }
      if (!p.gender) { e.gender = "Required"; valid = false; }
      if (!p.mobile.match(/^\d{10}$/)) { e.mobile = "Enter valid 10-digit number"; valid = false; }
      if (!p.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { e.email = "Enter valid email"; valid = false; }
      return e;
    });
    setErrors(newErrors);
    if (valid) {
      setPassengerDetails(passengers);
      onValidated(passengers);
    }
    return valid;
  };

  return (
    <div className="space-y-5">
      {/* Passenger cards */}
      {passengers.map((p, idx) => (
        <div
          key={p.seatId}
          className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
            pendingTraveller ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
                <User size={16} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Passenger {idx + 1}</p>
                <p className="text-xs text-gray-400">Seat: {p.seatNumber}</p>
              </div>
            </div>
            {/* Quick-fill slot button — shown when a chip is pending */}
            {pendingTraveller && (
              <button
                type="button"
                onClick={() => fillSlot(idx, pendingTraveller)}
                className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fill here
              </button>
            )}
            {/* Filled-from badge */}
            {!pendingTraveller && p.savedTravellerId && (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Auto-filled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PassengerField label="Full Name *" error={errors[idx]?.name}>
              <input
                type="text"
                value={p.name}
                onChange={(e) => update(idx, "name", e.target.value)}
                placeholder="e.g. Tanmay Kamble"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[idx]?.name ? "border-red-400" : "border-gray-200"}`}
              />
            </PassengerField>

            <PassengerField label="Age *" error={errors[idx]?.age}>
              <input
                type="number"
                value={p.age}
                onChange={(e) => update(idx, "age", e.target.value)}
                placeholder="25"
                min={1} max={120}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[idx]?.age ? "border-red-400" : "border-gray-200"}`}
              />
            </PassengerField>

            <PassengerField label="Gender *" error={errors[idx]?.gender}>
              <select
                value={p.gender}
                onChange={(e) => update(idx, "gender", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[idx]?.gender ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </PassengerField>

            <PassengerField label="Mobile Number *" error={errors[idx]?.mobile}>
              <input
                type="tel"
                value={p.mobile}
                onChange={(e) => update(idx, "mobile", e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[idx]?.mobile ? "border-red-400" : "border-gray-200"}`}
              />
            </PassengerField>

            <PassengerField label="Email Address *" error={errors[idx]?.email}>
              <input
                type="email"
                value={p.email}
                onChange={(e) => update(idx, "email", e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[idx]?.email ? "border-red-400" : "border-gray-200"}`}
              />
            </PassengerField>
          </div>

          {/* Save checkbox — only when manually filled */}
          {user && !p.savedTravellerId && (p.name || p.mobile) && (
            <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={p.saveTraveller}
                onChange={(e) => update(idx, "saveTraveller", e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                Save this traveller for future bookings
              </span>
            </label>
          )}
        </div>
      ))}

      {/* Confirm & Book */}
      <button
        onClick={validate}
        disabled={isBooking}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
      >
        {isBooking && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {isBooking ? "Processing…" : "Confirm & Book"}
      </button>

      {/* Saved travellers strip — below the button */}
      {user && savedTravellers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {passengers.length > 1 && pendingTraveller
                ? "Now tap 'Fill here' on a passenger above"
                : "Quick-fill from saved travellers"}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {savedTravellers.map((t) => {
              const isPending = pendingTraveller?._id === t._id;
              const isFilled = passengers.some((p) => p.savedTravellerId === String(t._id));
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => handleChipClick(t)}
                  className={`flex-shrink-0 flex items-center gap-2.5 border rounded-full px-3 py-2 transition-all ${
                    isPending
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : isFilled
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(t.gender)}`}>
                    {getInitials(t.fullName)}
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold leading-tight ${isPending ? "text-blue-700" : isFilled ? "text-green-700" : "text-gray-800"}`}>
                      {t.fullName.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">{t.age}y · {t.gender}</p>
                  </div>
                  {t.isPrimary && !isFilled && (
                    <span className="text-[9px] font-bold text-blue-500 uppercase">Primary</span>
                  )}
                  {isFilled && (
                    <span className="text-[9px] font-bold text-green-600">✓ Filled</span>
                  )}
                </button>
              );
            })}
          </div>

          {passengers.length > 1 && !pendingTraveller && (
            <p className="text-[10px] text-gray-400 mt-2.5">
              Tap a traveller, then choose which passenger slot to fill above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
