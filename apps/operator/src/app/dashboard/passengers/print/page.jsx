"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOperatorAuth } from "@/context/OperatorAuthContext";

function PrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const { operator } = useOperatorAuth();
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    if (!tripId) return;
    fetch(`/api/operator/manifest?tripId=${tripId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setManifest(d); })
      .catch(() => {});
  }, [tripId]);

  useEffect(() => {
    if (!manifest) return;
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, [manifest]);

  if (!manifest) {
    return <p className="p-8 text-center text-slate-400">Loading manifest…</p>;
  }

  const { tripSummary, passengers } = manifest;

  return (
    <div className="p-8 max-w-4xl mx-auto" style={{ fontSize: "12px" }}>
      <style>{`@media print { body { font-size: 11px; } }`}</style>

      <button onClick={() => router.back()} className="print:hidden mb-4 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
        Close
      </button>

      <div className="border-b border-slate-300 pb-3 mb-4">
        <h1 className="text-lg font-bold text-slate-900">{operator?.companyName || operator?.name || "NexaBus Operator"}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mt-1">
          <span>Route: {tripSummary.route}</span>
          <span>Bus: {tripSummary.busName} {tripSummary.busNumber}</span>
          <span>Date: {tripSummary.departureDate}</span>
          <span>Departure: {tripSummary.departureTime}</span>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-400">
            <th className="py-1.5 pr-2">Seat</th>
            <th className="py-1.5 pr-2">Name</th>
            <th className="py-1.5 pr-2">Age</th>
            <th className="py-1.5 pr-2">Gender</th>
            <th className="py-1.5 pr-2">Mobile</th>
            <th className="py-1.5 pr-2">Boarding</th>
            <th className="py-1.5 pr-2">Dropping</th>
            <th className="py-1.5 pr-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((p, i) => (
            <tr key={`${p.bookingMongoId}_${p.seatNumber}_${i}`} className="border-b border-slate-200">
              <td className="py-1.5 pr-2">{p.seatNumber}</td>
              <td className="py-1.5 pr-2">{p.name}</td>
              <td className="py-1.5 pr-2">{p.age}</td>
              <td className="py-1.5 pr-2">{p.gender}</td>
              <td className="py-1.5 pr-2">{p.mobile}</td>
              <td className="py-1.5 pr-2">{p.boardingPoint}</td>
              <td className="py-1.5 pr-2">{p.droppingPoint}</td>
              <td className="py-1.5 pr-2 capitalize">{p.bookingStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-slate-400 mt-4">{passengers.length} passenger{passengers.length !== 1 ? "s" : ""} · Generated {new Date().toLocaleString()}</p>
    </div>
  );
}

export default function PrintManifestPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-400">Loading…</p>}>
      <PrintContent />
    </Suspense>
  );
}
