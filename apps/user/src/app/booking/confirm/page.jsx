"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Ticket, Tag, X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import ProgressStepper from "@/components/ProgressStepper";
import PassengerForm from "@/components/PassengerForm";
import BookingSuccessModal from "@/components/BookingSuccessModal";
import OffersDrawer from "@/components/offers/OffersDrawer";
import useBookingStore from "@/store/bookingStore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ConfirmPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    selectedBus,
    selectedSeats,
    boardingPoint,
    droppingPoint,
    searchParams,
    confirmBooking,
    setBookingId,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useBookingStore();

  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | "success" | "invalid" | "minAmount"
  const [couponMsg, setCouponMsg] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const couponInputRef = useRef(null);

  useEffect(() => {
    if (!selectedBus || !selectedSeats.length) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedBus || !selectedSeats.length) return null;

  const baseFare = selectedBus.price * selectedSeats.length;
  const tax = Math.round(baseFare * 0.05);
  const serviceFee = 30;
  const subtotal = baseFare + tax + serviceFee;
  const total = subtotal - couponDiscount;

  const handleApplyCoupon = (codeOverride) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) return;
    const result = applyCoupon(code, subtotal);
    if (result.success) {
      setCouponStatus("success");
      setCouponMsg(`Coupon ${code} applied! You save ₹${result.discount}`);
      setCouponInput(code);
    } else if (result.error === "invalid") {
      setCouponStatus("invalid");
      setCouponMsg("Invalid coupon code. Please check and try again.");
    } else if (result.error === "minAmount") {
      setCouponStatus("minAmount");
      setCouponMsg(`Minimum booking amount is ₹${result.minAmount}`);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
    setCouponStatus(null);
    setCouponMsg("");
  };

  const handleDrawerApply = (code) => {
    setCouponInput(code);
    handleApplyCoupon(code);
  };

  const handleConfirmed = async (passengers) => {
    setIsBooking(true);
    try {
      const baseFare = selectedBus.price * selectedSeats.length;
      const tax = Math.round(baseFare * 0.05);
      const serviceFee = 30;
      const subtotal = baseFare + tax + serviceFee;
      const total = subtotal - couponDiscount;

      if (user) {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busId: selectedBus.id,
            busName: selectedBus.operator,
            busType: selectedBus.type,
            from: searchParams.from,
            to: searchParams.to,
            date: searchParams.date,
            departure: selectedBus.departure,
            arrival: selectedBus.arrival,
            boardingPoint,
            droppingPoint,
            seats: selectedSeats.map((s) => ({ id: s.id, number: s.number })),
            passengers: (passengers || []).map((p) => ({
              name: p.name,
              age: Number(p.age),
              gender: p.gender,
              seatNumber: p.seatNumber,
              mobile: p.mobile,
              email: p.email,
            })),
            baseFare,
            tax,
            serviceFee,
            discount: couponDiscount,
            total,
            couponCode: appliedCoupon?.code || "",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Booking failed");
        }
        const data = await res.json();
        confirmBooking();
        setBookingId(data.booking.bookingId);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        confirmBooking();
      }

      setIsBooking(false);
      setShowModal(true);
      toast.success("Booking confirmed!");
    } catch (err) {
      setIsBooking(false);
      toast.error(err.message || "Booking failed. Please try again.");
    }
  };

  return (
    <div>
      <ProgressStepper currentStep={4} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to seat selection
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">Passenger Details</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Passenger form */}
          <div className="flex-1 order-2 lg:order-1">
            <PassengerForm onValidated={handleConfirmed} />
          </div>

          {/* Order summary — shows first on mobile */}
          <div className="w-full lg:w-80 order-1 lg:order-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-4">
              <h3 className="font-semibold text-gray-800">Order Summary</h3>

              <div className="bg-blue-50 rounded-lg p-4 space-y-1">
                <p className="font-semibold text-blue-800 text-sm">{selectedBus.operator}</p>
                <p className="text-xs text-blue-600">{selectedBus.type}</p>
                <div className="flex items-center gap-1 text-blue-800 text-sm font-medium mt-2">
                  <span>{selectedBus.departure}</span>
                  <ChevronRight size={13} />
                  <span>{selectedBus.arrival}</span>
                </div>
                <p className="text-xs text-blue-500">{searchParams.date}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">ROUTE</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium">{searchParams.from}</span>
                  <ChevronRight size={13} className="text-gray-400" />
                  <span className="font-medium">{searchParams.to}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">Boarding</p>
                  <p className="text-gray-700 font-medium">{boardingPoint || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Dropping</p>
                  <p className="text-gray-700 font-medium">{droppingPoint || "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">SEATS</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="bg-blue-100 text-blue-800 font-semibold text-xs px-2 py-1 rounded-md"
                    >
                      {s.number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Coupon section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket size={15} className="text-gray-600" />
                  <p className="text-sm font-semibold text-gray-800">Apply Coupon</p>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-green-600" />
                      <span className="font-mono text-xs font-bold text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      ref={couponInputRef}
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponStatus(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Status message */}
                {couponStatus && !appliedCoupon && (
                  <div
                    className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium animate-[fadeIn_0.2s_ease-in] ${
                      couponStatus === "success"
                        ? "bg-green-50 border border-green-400 text-green-700"
                        : couponStatus === "invalid"
                        ? "bg-red-50 border border-red-400 text-red-700"
                        : "bg-orange-50 border border-orange-400 text-orange-700"
                    }`}
                  >
                    {couponStatus === "success" && <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />}
                    {couponStatus === "invalid" && <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />}
                    {couponStatus === "minAmount" && <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />}
                    {couponMsg}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-400 text-green-700 rounded-lg px-3 py-2 text-xs font-medium animate-[fadeIn_0.2s_ease-in]">
                    <CheckCircle size={13} className="flex-shrink-0" />
                    {couponMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                >
                  View all offers
                </button>
              </div>

              {/* Fare breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""})</span>
                  <span>₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Service fee</span>
                  <span>₹{serviceFee}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs font-medium animate-[fadeIn_0.3s_ease-in]">
                    <span>Discount (coupon)</span>
                    <span>- ₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span>
                  <span className="transition-all duration-300">₹{total}</span>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-xs text-green-600 text-right font-medium">
                    You save ₹{couponDiscount} 🎉
                  </p>
                )}
              </div>

              {isBooking && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  Processing your booking...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && <BookingSuccessModal onClose={() => setShowModal(false)} />}
      <OffersDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onApply={handleDrawerApply} />
    </div>
  );
}
