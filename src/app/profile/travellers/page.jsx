"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TravellerCard from "@/components/travellers/TravellerCard";
import TravellerModal from "@/components/travellers/TravellerModal";
import TravellerEmptyState from "@/components/travellers/TravellerEmptyState";
import toast from "react-hot-toast";

export default function MyTravellersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [travellers, setTravellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTraveller, setEditTraveller] = useState(null);

  const fetchTravellers = useCallback(async () => {
    try {
      const res = await fetch("/api/travellers");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTravellers(data.travellers || []);
    } catch {
      toast.error("Could not load travellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile/travellers");
      return;
    }
    if (!authLoading && user) fetchTravellers();
  }, [authLoading, user, router, fetchTravellers]);

  function openAdd() {
    setEditTraveller(null);
    setModalOpen(true);
  }

  function openEdit(t) {
    setEditTraveller(t);
    setModalOpen(true);
  }

  function handleDelete(id) {
    setTravellers((prev) => prev.filter((t) => String(t._id) !== String(id)));
  }

  const count = travellers.length;
  const atLimit = count >= 10;
  const nearLimit = count >= 8 && count < 10;

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Travellers</h1>
            <p className="text-sm text-gray-400">{count} of 10 travellers saved</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          disabled={atLimit}
          title={atLimit ? "Maximum limit reached. Delete a traveller to add new." : ""}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Limit warnings */}
      {atLimit && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          Maximum limit reached. Delete a traveller to add a new one.
        </div>
      )}
      {nearLimit && !atLimit && (
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-6 text-sm text-yellow-800">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          You can save up to 10 travellers. {10 - count} slot{10 - count !== 1 ? "s" : ""} remaining.
        </div>
      )}

      {/* Empty state */}
      {count === 0 ? (
        <TravellerEmptyState onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {travellers.map((t) => (
            <TravellerCard
              key={t._id}
              traveller={t}
              onEdit={openEdit}
              onDelete={handleDelete}
              onSetPrimary={() => {}}
              onRefresh={fetchTravellers}
            />
          ))}
        </div>
      )}

      <TravellerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editTraveller={editTraveller}
        onSaved={fetchTravellers}
      />
    </div>
  );
}
