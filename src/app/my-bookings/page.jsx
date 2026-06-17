"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket, ChevronRight, ChevronDown, ArrowRight,
  Calendar, Clock, CheckCircle, XCircle, Bus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import CancelBookingModal from "@/components/CancelBookingModal";
import BookingCancelledSuccessModal from "@/components/BookingCancelledSuccessModal";

const TABS = ["All", "Upcoming", "Completed", "Cancelled"];

// Derive effective trip status from booking fields (no DB write needed)
function getTripStatus(booking) {
  if (booking.status === "cancelled") return "cancelled";
  const { date, departure, arrival } = booking;
  if (!date) return "confirmed";

  const now = new Date();
  const [y, mo, d] = date.split("-").map(Number);

  // Full data path: precise departure + arrival datetimes
  if (departure && arrival) {
    const [depH, depM] = departure.split(":").map(Number);
    const depAt = new Date(y, mo - 1, d, depH, depM, 0);

    const [arrH, arrM] = arrival.split(":").map(Number);
    const arrAt = new Date(y, mo - 1, d, arrH, arrM, 0);
    // Overnight bus: arrival earlier than departure → next calendar day
    if (arrAt <= depAt) arrAt.setDate(arrAt.getDate() + 1);

    if (now >= arrAt) return "completed";
    if (now >= depAt) return "in_progress";
    return "confirmed";
  }

  // Fallback for older bookings without arrival stored
  const endOfJourneyDay = new Date(y, mo - 1, d, 23, 59, 59);
  if (now > endOfJourneyDay) return "completed";

  if (departure) {
    const [depH, depM] = departure.split(":").map(Number);
    const depAt = new Date(y, mo - 1, d, depH, depM, 0);
    if (now >= depAt) return "in_progress";
  }

  return "confirmed";
}

function statusBadge(tripStatus) {
  if (tripStatus === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle size={11} /> Confirmed
      </span>
    );
  }
  if (tripStatus === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <Bus size={11} /> In Progress
      </span>
    );
  }
  if (tripStatus === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
        <CheckCircle size={11} /> Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      <XCircle size={11} /> Cancelled
    </span>
  );
}

function BookingCard({ booking, onCancelClick }) {
  const [expanded, setExpanded] = useState(false);
  const tripStatus = getTripStatus(booking);
  const canCancel = tripStatus === "confirmed";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-gray-400 tracking-wide">
                {booking.bookingId}
              </span>
              {statusBadge(tripStatus)}
            </div>
            <div className="flex items-center gap-1.5 text-gray-900 font-bold text-base mt-1">
              <span>{booking.from}</span>
              <ArrowRight size={15} className="text-blue-500 flex-shrink-0" />
              <span>{booking.to}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {booking.date}
              </span>
              {booking.departure && (
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {booking.departure}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-blue-600">₹{booking.total}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {booking.seats?.length || 0} seat{booking.seats?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Bus name */}
        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600">
          <Bus size={14} className="text-blue-400 flex-shrink-0" />
          <span className="font-medium">{booking.busName}</span>
          {booking.busType && <span className="text-gray-400">· {booking.busType}</span>}
        </div>

        {/* Seats */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {booking.seats?.map((s, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-700 font-semibold text-xs px-2 py-0.5 rounded-md border border-blue-100"
            >
              {s.number}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {expanded ? "Hide details" : "View details"}
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {canCancel && (
            <button
              onClick={() => onCancelClick(booking)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Boarding</p>
              <p className="text-sm text-gray-700 font-medium">{booking.boardingPoint || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Dropping</p>
              <p className="text-sm text-gray-700 font-medium">{booking.droppingPoint || "—"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Fare Breakdown</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Base fare</span><span>₹{booking.baseFare}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>GST (5%)</span><span>₹{booking.tax}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Service fee</span><span>₹{booking.serviceFee}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>Coupon ({booking.couponCode})</span><span>- ₹{booking.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                <span>Total</span><span>₹{booking.total}</span>
              </div>
            </div>
          </div>

          {booking.passengers?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Passengers</p>
              <div className="space-y-1.5">
                {booking.passengers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm bg-white rounded-lg px-3 py-2 border border-gray-100"
                  >
                    <span className="font-semibold text-blue-600 min-w-[28px]">{p.seatNumber}</span>
                    <span className="text-gray-800 font-medium">{p.name}</span>
                    <span className="text-gray-400 text-xs capitalize">{p.gender} · {p.age}y</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/my-bookings");
      return;
    }
    if (!authLoading && user) fetchBookings();
  }, [authLoading, user, router, fetchBookings]);

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelTarget.bookingId}/cancel`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === cancelTarget.bookingId
            ? { ...b, status: "cancelled", cancelledAt: new Date().toISOString() }
            : b
        )
      );
      setCancelTarget(null);
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.message || "Unable to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  }

  const filtered = bookings.filter((b) => {
    if (tab === "All") return true;
    const s = getTripStatus(b);
    if (tab === "Upcoming") return s === "confirmed" || s === "in_progress";
    if (tab === "Completed") return s === "completed";
    if (tab === "Cancelled") return s === "cancelled";
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">All your bus ticket bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map((t) => {
          const count =
            t === "All" ? bookings.length
            : t === "Upcoming" ? bookings.filter((b) => { const s = getTripStatus(b); return s === "confirmed" || s === "in_progress"; }).length
            : t === "Completed" ? bookings.filter((b) => getTripStatus(b) === "completed").length
            : bookings.filter((b) => getTripStatus(b) === "cancelled").length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            {tab === "Completed" ? "No completed trips yet"
              : tab === "Cancelled" ? "No cancelled bookings"
              : tab === "Upcoming" ? "No upcoming trips"
              : "No bookings yet"}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {tab === "All"
              ? "Book your first bus ticket and it'll appear here"
              : "Nothing to show in this category"}
          </p>
          {tab === "All" && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Search Buses <ChevronRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onCancelClick={setCancelTarget}
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
          isCancelling={isCancelling}
        />
      )}

      {/* Success modal */}
      {showSuccess && (
        <BookingCancelledSuccessModal onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
