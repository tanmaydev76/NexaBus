"use client";
import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, X, Phone, Calendar, IndianRupee, TrendingUp, TicketCheck, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const GENDER_COLORS = ["#2563EB", "#ec4899", "#6366f1"];

function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function BookingsAnalytics({ stats }) {
  if (!stats) return null;
  const { totalBookings, todayBookings, totalRevenue, cancelledCount, last7Days, genderBreakdown, routeWise } = stats;

  return (
    <div className="space-y-5 mb-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TicketCheck}  label="Total Bookings"   value={totalBookings}                  color="blue"   />
        <StatCard icon={TrendingUp}   label="Today's Bookings" value={todayBookings}                  color="green"  />
        <StatCard icon={IndianRupee}  label="Total Revenue"    value={`₹${(totalRevenue || 0).toLocaleString("en-IN")}`} color="purple" />
        <StatCard icon={XCircle}      label="Cancelled"        value={cancelledCount}                 color="red"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Last 7 days line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Bookings — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={last7Days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip
                labelFormatter={(d) => d}
                formatter={(v, name) => [name === "revenue" ? `₹${v}` : v, name === "revenue" ? "Revenue" : "Bookings"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line type="monotone" dataKey="count"   stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} name="count" />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gender breakdown pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Passenger Gender</h3>
          {genderBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={genderBreakdown} dataKey="count" nameKey="gender"
                  cx="50%" cy="50%" outerRadius={60} label={({ gender, percent }) =>
                    `${gender} ${(percent * 100).toFixed(0)}%`
                  } labelLine={false}>
                  {genderBreakdown.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No passenger data</div>
          )}
        </div>
      </div>

      {/* Route-wise table */}
      {routeWise?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Top Routes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {routeWise.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5 font-medium text-slate-700">{r.from} → {r.to}</td>
                  <td className="px-5 py-2.5 text-right text-slate-600">{r.count}</td>
                  <td className="px-5 py-2.5 text-right font-semibold text-slate-800">₹{(r.revenue || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/operator/bookings/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

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

      <BookingsAnalytics stats={stats} />

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
