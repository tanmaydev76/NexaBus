import { create } from "zustand";
import { offers } from "@/lib/mockData";

const useBookingStore = create((set) => ({
  searchParams: { from: "", to: "", date: "" },
  selectedBus: null,
  selectedSeats: [],
  boardingPoint: "",
  droppingPoint: "",
  passengerDetails: [],
  bookingId: "",
  appliedCoupon: null,
  couponDiscount: 0,
  bookingForWomen: false,

  filters: {
    quickFilters: [],
    departureSlots: [],
    arrivalSlots: [],
    busTypes: [],
    singleWindow: null,
    busFeatures: [],
    operators: [],
    boardingPoints: [],
    droppingPoints: [],
    amenities: [],
  },

  setSearchParams: (params) =>
    set({ searchParams: params }),

  setSelectedBus: (bus) =>
    set({ selectedBus: bus, selectedSeats: [], boardingPoint: "", droppingPoint: "" }),

  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.find((s) => s.id === seat.id);
      if (exists) {
        return { selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id) };
      }
      if (state.selectedSeats.length >= 6) return state;
      return { selectedSeats: [...state.selectedSeats, seat] };
    }),

  setBookingForWomen: (val) => set({ bookingForWomen: val }),

  toggleQuickFilter: (id) =>
    set((s) => {
      const active = s.filters.quickFilters;
      return { filters: { ...s.filters, quickFilters: active.includes(id) ? active.filter((f) => f !== id) : [...active, id] } };
    }),
  toggleDepartureSlot: (id) =>
    set((s) => {
      const active = s.filters.departureSlots;
      return { filters: { ...s.filters, departureSlots: active.includes(id) ? active.filter((f) => f !== id) : [...active, id] } };
    }),
  toggleArrivalSlot: (id) =>
    set((s) => {
      const active = s.filters.arrivalSlots;
      return { filters: { ...s.filters, arrivalSlots: active.includes(id) ? active.filter((f) => f !== id) : [...active, id] } };
    }),
  toggleBusType: (type) =>
    set((s) => {
      const active = s.filters.busTypes;
      return { filters: { ...s.filters, busTypes: active.includes(type) ? active.filter((t) => t !== type) : [...active, type] } };
    }),
  setSingleWindow: (value) =>
    set((s) => ({ filters: { ...s.filters, singleWindow: value } })),
  toggleBusFeature: (f) =>
    set((s) => { const a = s.filters.busFeatures; return { filters: { ...s.filters, busFeatures: a.includes(f) ? a.filter((x) => x !== f) : [...a, f] } }; }),
  toggleOperator: (o) =>
    set((s) => { const a = s.filters.operators; return { filters: { ...s.filters, operators: a.includes(o) ? a.filter((x) => x !== o) : [...a, o] } }; }),
  toggleBoardingPoint: (p) =>
    set((s) => { const a = s.filters.boardingPoints; return { filters: { ...s.filters, boardingPoints: a.includes(p) ? a.filter((x) => x !== p) : [...a, p] } }; }),
  toggleDroppingPoint: (p) =>
    set((s) => { const a = s.filters.droppingPoints; return { filters: { ...s.filters, droppingPoints: a.includes(p) ? a.filter((x) => x !== p) : [...a, p] } }; }),
  toggleAmenity: (a) =>
    set((s) => { const arr = s.filters.amenities; return { filters: { ...s.filters, amenities: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] } }; }),
  clearAllFilters: () =>
    set({ filters: { quickFilters: [], departureSlots: [], arrivalSlots: [], busTypes: [], singleWindow: null, busFeatures: [], operators: [], boardingPoints: [], droppingPoints: [], amenities: [] } }),
  setBoardingPoint: (point) => set({ boardingPoint: point }),
  setDroppingPoint: (point) => set({ droppingPoint: point }),

  setPassengerDetails: (details) => set({ passengerDetails: details }),

  applyCoupon: (couponCode, totalFare) => {
    const offer = offers.find(
      (o) => o.code.toUpperCase() === couponCode.toUpperCase()
    );
    if (!offer) return { success: false, error: "invalid" };
    if (totalFare < offer.minAmount) {
      return { success: false, error: "minAmount", minAmount: offer.minAmount };
    }

    let discount = 0;
    if (offer.discountType === "flat") {
      discount = offer.discount;
    } else {
      discount = Math.round((totalFare * offer.discount) / 100);
      if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount);
    }
    discount = Math.min(discount, totalFare);

    set({ appliedCoupon: { ...offer, appliedDiscount: discount }, couponDiscount: discount });
    return { success: true, discount };
  },

  removeCoupon: () => set({ appliedCoupon: null, couponDiscount: 0 }),

  confirmBooking: () => {
    const id = "NB" + Math.random().toString(36).substr(2, 8).toUpperCase();
    set({ bookingId: id });
    return id;
  },

  setBookingId: (id) => set({ bookingId: id }),

  resetBooking: () =>
    set({
      selectedBus: null,
      selectedSeats: [],
      boardingPoint: "",
      droppingPoint: "",
      passengerDetails: [],
      bookingId: "",
      appliedCoupon: null,
      couponDiscount: 0,
    }),
}));

export default useBookingStore;
