"use client";
import { useState, useEffect } from "react";
import { TrendingUp, IndianRupee, Users, Bus, Calendar } from "lucide-react";
import toast from "react-hot-toast";

function StatCard({ label, value, icon: Icon, color = "brand" }) {
  const colorMap = {
    brand:  "bg-brand/10 text-brand",
    green:  "bg-green-100 text-green-600",
    blue:   "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/operator/stats?range=${range}`);
        const d = await r.json();
        setStats(d);
      } catch { toast.error("Failed to load reports"); }
      finally { setLoading(false); }
    })();
  }, [range]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Revenue and performance analytics</p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={IndianRupee} color="brand" />
            <StatCard label="Total Bookings" value={stats?.totalBookings || 0} icon={Users} color="blue" />
            <StatCard label="Trips Operated" value={stats?.totalTrips || 0} icon={Calendar} color="green" />
            <StatCard label="Active Buses" value={stats?.activeBuses || 0} icon={Bus} color="purple" />
          </div>

          {/* Revenue breakdown placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand" /> Revenue Trend
            </h3>
            <div className="flex items-center justify-center py-16 text-center">
              <div>
                <TrendingUp size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Revenue chart visualization coming soon</p>
                <p className="text-xs text-slate-300 mt-1">Currently showing summary stats above</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
