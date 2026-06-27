"use client";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  Users, CheckCircle2, Clock, XCircle, Search, MapPin, Printer, Download,
  ArrowLeft, Eye, Phone, MessageCircle, ChevronDown, ChevronUp, X, Calendar,
} from "lucide-react";
import PassengerDetailDrawer from "@/components/passengers/PassengerDetailDrawer";

const BOARDING_LABELS = { not_arrived: "Not Arrived", waiting: "Waiting", boarded: "Boarded", no_show: "No Show" };
const BOARDING_STYLES = {
  not_arrived: "bg-slate-100 text-slate-600",
  waiting:     "bg-yellow-100 text-yellow-700",
  boarded:     "bg-green-100 text-green-700",
  no_show:     "bg-red-100 text-red-600",
};
const BOARDING_ORDER = ["not_arrived", "waiting", "boarded", "no_show"];

function maskMobile(mobile) {
  if (!mobile) return "—";
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 6) return mobile;
  return `${digits.slice(0, 5)} XXXXX`;
}

function digitsOnly(mobile) {
  return (mobile || "").replace(/\D/g, "");
}

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function BoardingStatusChanger({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {BOARDING_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => { onChange(s); setOpen(false); }}
            className={`text-[11px] font-semibold px-2 py-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50 ${BOARDING_STYLES[s]}`}
          >
            {BOARDING_LABELS[s]}
          </button>
        ))}
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${BOARDING_STYLES[status] || BOARDING_STYLES.not_arrived}`}
    >
      {BOARDING_LABELS[status] || status}
    </button>
  );
}

function PassengerActions({ passenger, onOpenDrawer }) {
  const mobile = digitsOnly(passenger.mobile);
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => onOpenDrawer(passenger)} title="View details" className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
        <Eye size={15} />
      </button>
      {mobile && (
        <>
          <a href={`tel:${mobile}`} title={passenger.mobile} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <Phone size={15} />
          </a>
          <a href={`https://wa.me/91${mobile}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            <MessageCircle size={15} />
          </a>
        </>
      )}
    </div>
  );
}

function PassengerRow({ passenger, onOpenDrawer, onStatusChange, updating }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="px-3 py-3"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{passenger.seatNumber}</span></td>
      <td className="px-3 py-3">
        <p className="text-sm font-medium text-slate-800">{passenger.name}</p>
        {passenger.email && <p className="text-xs text-slate-400">{passenger.email}</p>}
      </td>
      <td className="px-3 py-3 text-sm text-slate-600">{passenger.age} / {passenger.gender}</td>
      <td className="px-3 py-3 text-sm text-slate-600">{maskMobile(passenger.mobile)}</td>
      <td className="px-3 py-3 text-sm text-slate-600">{passenger.boardingPoint || "—"}</td>
      <td className="px-3 py-3 text-sm text-slate-600">{passenger.droppingPoint || "—"}</td>
      <td className="px-3 py-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${passenger.bookingStatus === "cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
          {passenger.bookingStatus}
        </span>
      </td>
      <td className="px-3 py-3">
        <BoardingStatusChanger
          status={passenger.boardingStatus}
          disabled={updating}
          onChange={(s) => onStatusChange(passenger.bookingMongoId, s)}
        />
      </td>
      <td className="px-3 py-3"><PassengerActions passenger={passenger} onOpenDrawer={onOpenDrawer} /></td>
    </tr>
  );
}

function PassengerCard({ passenger, onOpenDrawer, onStatusChange, updating }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{passenger.seatNumber}</span>
            <p className="text-sm font-semibold text-slate-800">{passenger.name}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">{passenger.age} / {passenger.gender} · {maskMobile(passenger.mobile)}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${passenger.bookingStatus === "cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
          {passenger.bookingStatus}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <MapPin size={12} className="text-green-500" /> {passenger.boardingPoint || "—"}
        <span className="text-slate-300">→</span>
        <MapPin size={12} className="text-red-500" /> {passenger.droppingPoint || "—"}
      </div>
      <div className="flex items-center justify-between pt-1">
        <BoardingStatusChanger
          status={passenger.boardingStatus}
          disabled={updating}
          onChange={(s) => onStatusChange(passenger.bookingMongoId, s)}
        />
        <PassengerActions passenger={passenger} onOpenDrawer={onOpenDrawer} />
      </div>
    </div>
  );
}

function TripPickerRow({ trip, onSelect }) {
  const bus = trip.busId;
  const route = trip.routeId;
  return (
    <button
      type="button"
      onClick={() => onSelect(trip._id)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-brand hover:shadow-md transition-all flex items-center justify-between gap-3"
    >
      <div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <span>{route?.origin || "?"}</span>
          <span className="text-slate-400">→</span>
          <span>{route?.destination || "?"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><Calendar size={11} />{trip.departureDate}</span>
          <span className="flex items-center gap-1"><Clock size={11} />{trip.departureTime}</span>
          <span>{bus?.busName} {bus?.busNumber && `· ${bus.busNumber}`}</span>
        </div>
      </div>
      <ChevronDown size={16} className="text-slate-300 -rotate-90 flex-shrink-0" />
    </button>
  );
}

function TripSelector() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState("today");
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (rangeFilter === "custom") {
      if (customDate) params.set("date", customDate);
    } else if (rangeFilter) {
      params.set("range", rangeFilter);
    }
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/operator/trips?${params}`)
      .then((r) => r.json())
      .then((d) => setTrips(d.trips || []))
      .catch(() => toast.error("Failed to load trips"))
      .finally(() => setLoading(false));
  }, [rangeFilter, customDate, statusFilter]);

  const filtered = useMemo(() => trips.filter((t) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const route = t.routeId;
    return (
      route?.origin?.toLowerCase().includes(q) ||
      route?.destination?.toLowerCase().includes(q) ||
      t.busId?.busName?.toLowerCase().includes(q)
    );
  }), [trips, search]);

  const handleSelect = (tripId) => router.push(`/dashboard/passengers?tripId=${tripId}`);

  return (
    <div className="p-6 lg:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Users size={24} className="text-brand" />
        </div>
        <h1 className="text-lg font-bold text-slate-800">Select a Trip to View Passengers</h1>
        <p className="text-sm text-slate-500 mt-1">Choose a trip below to see its passenger manifest</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 max-w-3xl mx-auto">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route or bus..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
        <select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Date</option>
          <option value="">All Dates</option>
        </select>
        {rangeFilter === "custom" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white"
          />
        )}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 bg-white">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">No trips found for this filter.</p>
        ) : (
          filtered.map((trip) => <TripPickerRow key={trip._id} trip={trip} onSelect={handleSelect} />)
        )}
      </div>
    </div>
  );
}

function ManifestView({ tripId }) {
  const router = useRouter();
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [drawerPassenger, setDrawerPassenger] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchManifest = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ tripId });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (boardingPoint) params.set("boardingPoint", boardingPoint);
      if (droppingPoint) params.set("droppingPoint", droppingPoint);
      if (bookingStatus) params.set("bookingStatus", bookingStatus);
      const r = await fetch(`/api/operator/manifest?${params}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to load manifest");
      setManifest(d);
      setLastUpdatedAt(Date.now());
    } catch (e) {
      if (!silent) toast.error(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, debouncedSearch, boardingPoint, droppingPoint, bookingStatus]);

  useEffect(() => { fetchManifest(false); }, [fetchManifest]);

  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 5000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") fetchManifest(true);
    }, 15000);
    return () => clearInterval(poll);
  }, [fetchManifest]);

  const handleStatusChange = async (bookingMongoId, newStatus) => {
    const prevPassengers = manifest.passengers;
    const updated = manifest.passengers.map((p) =>
      p.bookingMongoId === bookingMongoId ? { ...p, boardingStatus: newStatus } : p
    );
    const stats = {
      totalPassengers: updated.length,
      boarded: updated.filter((p) => p.boardingStatus === "boarded").length,
      waiting: updated.filter((p) => p.boardingStatus === "waiting").length,
      noShow: updated.filter((p) => p.boardingStatus === "no_show").length,
      notArrived: updated.filter((p) => p.boardingStatus === "not_arrived").length,
    };
    setManifest((m) => ({ ...m, passengers: updated, stats }));
    setUpdatingBookingId(bookingMongoId);
    try {
      const r = await fetch("/api/operator/manifest/boarding-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingMongoId, newStatus }),
      });
      if (!r.ok) throw new Error("Failed to update status");
    } catch {
      toast.error("Failed to update boarding status — reverted");
      setManifest((m) => ({ ...m, passengers: prevPassengers }));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const clearFilters = () => { setSearch(""); setBoardingPoint(""); setDroppingPoint(""); setBookingStatus(""); };
  const hasFilters = search || boardingPoint || droppingPoint || bookingStatus;

  const exportCSV = () => {
    if (!manifest?.passengers?.length) return;
    const headers = ["Seat", "Name", "Age", "Gender", "Mobile", "Boarding", "Dropping", "Departure", "Arrival", "Fare", "Status", "Boarding Status", "Booking ID"];
    const rows = manifest.passengers.map((p) => [
      p.seatNumber, p.name, p.age, p.gender, p.mobile, p.boardingPoint, p.droppingPoint,
      p.departure, p.arrival, p.fare, p.bookingStatus, p.boardingStatus, p.bookingId,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifest-${tripId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!manifest) return null;
  const { tripSummary, stats, passengers } = manifest;
  const secondsAgo = lastUpdatedAt ? Math.max(0, Math.round((nowTick - lastUpdatedAt) / 1000)) : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button onClick={() => router.push("/dashboard/passengers")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand">
          <ArrowLeft size={15} /> Back to Trips
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            {tripSummary.route} · {tripSummary.departureDate} · {tripSummary.departureTime}
          </span>
          <button onClick={() => window.open(`/dashboard/passengers/print?tripId=${tripId}`, "_blank")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Printer size={14} /> Print
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <StatCard icon={Users} label="Total Passengers" value={stats.totalPassengers} colorClass="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Boarded" value={stats.boarded} colorClass="bg-green-100 text-green-600" />
        <StatCard icon={Clock} label="Waiting" value={stats.waiting} colorClass="bg-yellow-100 text-yellow-600" />
        <StatCard icon={XCircle} label="No Show" value={stats.noShow} colorClass="bg-red-100 text-red-600" />
        <StatCard icon={Users} label="Occupancy" value={`${tripSummary.occupancyPercent}% (${tripSummary.bookedSeats}/${tripSummary.totalSeats})`} colorClass="bg-brand/10 text-brand" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5">
        <button onClick={() => setSummaryOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">Trip Summary</span>
          {summaryOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {summaryOpen && (
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 border-t border-slate-100 pt-3">
            <p><span className="text-slate-400">Bus:</span> {tripSummary.busName} {tripSummary.busNumber} ({tripSummary.busType})</p>
            <p><span className="text-slate-400">Route:</span> {tripSummary.routeName || tripSummary.route}</p>
            <p><span className="text-slate-400">Revenue:</span> ₹{tripSummary.revenue?.toLocaleString()}</p>
            <p><span className="text-slate-400">Boarding points:</span> {tripSummary.boardingPoints.join(", ") || "—"}</p>
            <p><span className="text-slate-400">Dropping points:</span> {tripSummary.droppingPoints.join(", ") || "—"}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
        <select value={boardingPoint} onChange={(e) => setBoardingPoint(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
          <option value="">All Boarding Points</option>
          {tripSummary.boardingPoints.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={droppingPoint} onChange={(e) => setDroppingPoint(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
          <option value="">All Dropping Points</option>
          {tripSummary.droppingPoints.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
          <option value="">All Bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-brand hover:text-brand-700 font-medium">Clear Filters</button>
        )}
      </div>

      {secondsAgo !== null && (
        <p className="text-xs text-slate-400 mb-4">Updated {secondsAgo}s ago</p>
      )}

      {passengers.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-16 bg-white rounded-xl border border-slate-200">
          No passengers match the current filters.
        </p>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                  <th className="px-3 py-2.5">Seat</th>
                  <th className="px-3 py-2.5">Passenger</th>
                  <th className="px-3 py-2.5">Age/Gender</th>
                  <th className="px-3 py-2.5">Mobile</th>
                  <th className="px-3 py-2.5">Boarding</th>
                  <th className="px-3 py-2.5">Dropping</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Boarding Status</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, i) => (
                  <PassengerRow
                    key={`${p.bookingMongoId}_${p.seatNumber}_${i}`}
                    passenger={p}
                    onOpenDrawer={setDrawerPassenger}
                    onStatusChange={handleStatusChange}
                    updating={updatingBookingId === p.bookingMongoId}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {passengers.map((p, i) => (
              <PassengerCard
                key={`${p.bookingMongoId}_${p.seatNumber}_${i}`}
                passenger={p}
                onOpenDrawer={setDrawerPassenger}
                onStatusChange={handleStatusChange}
                updating={updatingBookingId === p.bookingMongoId}
              />
            ))}
          </div>
        </>
      )}

      {drawerPassenger && (
        <PassengerDetailDrawer
          passenger={drawerPassenger}
          onClose={() => setDrawerPassenger(null)}
          onStatusChange={handleStatusChange}
          updating={updatingBookingId === drawerPassenger.bookingMongoId}
        />
      )}
    </div>
  );
}

function PassengersContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  return tripId ? <ManifestView key={tripId} tripId={tripId} /> : <TripSelector />;
}

export default function PassengersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <PassengersContent />
    </Suspense>
  );
}
