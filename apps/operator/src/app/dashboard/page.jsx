"use client";
import { useState, useEffect } from "react";
import {
  Bus, CalendarDays, Ticket, IndianRupee,
  TrendingUp, Percent, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, prefix = "", suffix = "" }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   icon: "text-blue-500" },
    green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
    teal:   { bg: "bg-teal-50",   text: "text-teal-700",   icon: "text-teal-500" },
    rose:   { bg: "bg-rose-50",   text: "text-rose-700",   icon: "text-rose-500" },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}{suffix}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={19} className={c.icon} />
        </div>
      </div>
    </div>
  );
}

// ── Revenue tooltip ─────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-bold text-gray-900">₹{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return status === "confirmed" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
      Confirmed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
      Cancelled
    </span>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/operator/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setStats(data);
      })
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 text-sm">{error}</div>
    );
  }

  const STAT_CARDS = [
    { label: "Total Buses",       value: stats.totalBuses,     icon: Bus,         color: "blue" },
    { label: "Active Trips",      value: stats.activeTrips,    icon: CalendarDays, color: "green" },
    { label: "Today's Bookings",  value: stats.todayBookings,  icon: Ticket,      color: "purple" },
    { label: "Today's Revenue",   value: stats.todayRevenue,   icon: IndianRupee, color: "orange", prefix: "₹" },
    { label: "Monthly Revenue",   value: stats.monthlyRevenue, icon: TrendingUp,  color: "teal",   prefix: "₹" },
    { label: "Occupancy Rate",    value: stats.occupancyRate,  icon: Percent,     color: "rose",   suffix: "%" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* 6 Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900">Revenue — Last 30 Days</h2>
            <p className="text-xs text-gray-400 mt-0.5">Daily booking revenue</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
            <ArrowUpRight size={16} />
            ₹{stats.monthlyRevenue.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyRevenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <span className="text-xs text-gray-400">{stats.recentBookings.length} latest</span>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No bookings yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Booking ID", "Passenger", "Route", "Seats", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentBookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-500">{b.bookingId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {b.passengers?.[0]?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {b.from} → {b.to}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.map((s, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 font-semibold text-[11px] px-1.5 py-0.5 rounded">
                            {s.number}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      ₹{b.total?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
