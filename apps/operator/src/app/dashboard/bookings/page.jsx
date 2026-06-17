"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, X, User, Phone, Calendar, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-slate-100 text-slate-600",
};

function BookingDrawer({ booking, onClose }) {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Booking Details</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="flex-1 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Booking ID</div>
              <div className="font-bold text-slate-800 font-mono text-sm mt-0.5">{booking.bookingId || booking._id}</div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-500"}`}>
              {booking.status}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Journey</div>
            <div className="flex gap-2 text-sm text-slate-700">
              <Calendar size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{booking.date || booking.departureDate || "—"}</span>
            </div>
          </div>

          {booking.passengers?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Passengers</div>
              <div className="space-y-2">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {(p.name || "P")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{p.name || "—"}</div>
                        {p.age && <div className="text-xs text-slate-400">Age: {p.age}</div>}
                      </div>
                      {p.gender && <span className="ml-auto text-xs text-slate-500 capitalize">{p.gender}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.seats?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Seats</div>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-brand/10 text-brand font-bold rounded-lg text-sm">
                    {s.number || s.seatNumber || s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Amount</span>
              <span className="text-lg font-bold text-slate-800">₹{booking.totalAmount?.toLocaleString() || booking.amount?.toLocaleString() || "—"}</span>
            </div>
            {booking.paymentStatus && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-slate-600">Payment Status</span>
                <span className={`text-xs font-semibold capitalize ${booking.paymentStatus === "paid" ? "text-green-600" : "text-orange-500"}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            )}
          </div>

          {booking.contactPhone && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Phone size={14} className="text-slate-400" />
              {booking.contactPhone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const r = await fetch(`/api/operator/bookings?${params}`);
      const d = await r.json();
      setBookings(d.bookings || []);
      setPages(d.pages || 1);
      setTotal(d.total || 0);
    } catch { toast.error("Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter, fromDate, toDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search booking ID or passenger name..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <input value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} type="date"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white" />
        <input value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} type="date"
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <IndianRupee size={28} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No bookings found</h3>
          <p className="text-sm text-slate-400">Bookings from passengers will appear here</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Booking ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Passenger</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelected(booking)}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-600">{(booking.bookingId || booking._id || "").slice(0, 12)}...</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {(booking.passengers?.[0]?.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700">{booking.passengers?.[0]?.name || "—"}</span>
                        {booking.passengers?.length > 1 && (
                          <span className="text-xs text-slate-400">+{booking.passengers.length - 1} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{booking.date || booking.departureDate || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ₹{(booking.totalAmount || booking.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-500"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-brand font-medium hover:underline">View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft size={14} /> Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
