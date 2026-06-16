"use client";
import { useState } from "react";
import { User } from "lucide-react";
import useBookingStore from "@/store/bookingStore";

function PassengerField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function PassengerForm({ onValidated }) {
  const { selectedSeats, setPassengerDetails } = useBookingStore();

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat) => ({
      seatId: seat.id,
      seatNumber: seat.number,
      name: "",
      age: "",
      gender: "",
      mobile: "",
      email: "",
    }))
  );
  const [errors, setErrors] = useState(selectedSeats.map(() => ({})));

  const update = (idx, field, value) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
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
    <div className="space-y-6">
      {passengers.map((p, idx) => (
        <div key={p.seatId} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <User size={16} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Passenger {idx + 1}</p>
              <p className="text-xs text-gray-400">Seat: {p.seatNumber}</p>
            </div>
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
                min={1}
                max={120}
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
        </div>
      ))}

      <button
        onClick={validate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
      >
        Confirm & Book
      </button>
    </div>
  );
}
