"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Bus, CalendarDays, UserRound, ArrowLeftRight, Clock, X,
} from "lucide-react";
import { cities } from "@/lib/mockData";
import useBookingStore from "@/store/bookingStore";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { createPortal } from "react-dom";

// ─── localStorage helpers ──────────────────────────────────────────────────────
const getRecent = () => {
  try { return JSON.parse(localStorage.getItem("nb_recent_cities") || "[]"); } catch { return []; }
};
const saveRecent = (city) => {
  try {
    const updated = [city, ...getRecent().filter((c) => c !== city)].slice(0, 5);
    localStorage.setItem("nb_recent_cities", JSON.stringify(updated));
  } catch {}
};

// ─── Highlight matching characters ────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <span>{text}</span>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <mark className="bg-yellow-100 text-yellow-800 not-italic rounded-sm px-0.5">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </span>
  );
}

// ─── Mobile fullscreen city picker ────────────────────────────────────────────
function MobileCityPicker({ label, search, onSearch, onSelect, selectedCity, excludeCity, onClose }) {
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setRecent(getRecent().filter((c) => c !== excludeCity));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [excludeCity]);

  const displayed = search
    ? cities.filter((c) => c !== excludeCity && c.toLowerCase().includes(search.toLowerCase()))
    : cities.filter((c) => c !== excludeCity);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
          <X size={20} className="text-gray-600" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search ${label} city...`}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          {search && (
            <button type="button" onClick={() => onSearch("")} className="text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Recent */}
      {recent.length > 0 && !search && (
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2.5">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelect(c)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 active:bg-blue-50 active:text-blue-600"
              >
                <Clock size={11} className="flex-shrink-0" />
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City list */}
      <ul className="flex-1 overflow-y-auto py-1">
        {displayed.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className={`w-full text-left px-5 py-4 text-sm flex items-center gap-3 border-b border-gray-50 active:bg-blue-50 transition-colors
                ${selectedCity === c ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"}`}
            >
              <Bus size={15} className="text-gray-400 flex-shrink-0" />
              <Highlight text={c} query={search} />
            </button>
          </li>
        ))}
        {displayed.length === 0 && (
          <li className="px-5 py-12 text-center text-sm text-gray-400">No cities found</li>
        )}
      </ul>
    </div>,
    document.body
  );
}

// ─── Desktop portalled city dropdown ──────────────────────────────────────────
function DesktopCityDropdown({ anchorRef, search, onSearch, onSelect, selectedCity, excludeCity, onClose }) {
  const [recent, setRecent] = useState([]);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });
  const dropRef = useRef(null);

  useEffect(() => {
    setRecent(getRecent().filter((c) => c !== excludeCity));
  }, [excludeCity]);

  useEffect(() => {
    const reposition = () => {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left, width: Math.max(rect.width, 320) });
    };
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const displayed = search
    ? cities.filter((c) => c !== excludeCity && c.toLowerCase().includes(search.toLowerCase()))
    : cities.filter((c) => c !== excludeCity);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={dropRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
      className="bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden"
    >
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search for a city..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          {search && (
            <button type="button" onClick={() => onSearch("")} className="text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      {recent.length > 0 && !search && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">Recent searches</p>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((c) => (
              <button key={c} type="button" onClick={() => onSelect(c)} className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <Clock size={9} className="flex-shrink-0" />{c}
              </button>
            ))}
          </div>
        </div>
      )}
      <ul className="max-h-52 overflow-y-auto py-1">
        {displayed.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors
                ${selectedCity === c ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
            >
              <Bus size={13} className="text-gray-400 flex-shrink-0" />
              <Highlight text={c} query={search} />
            </button>
          </li>
        ))}
        {displayed.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-gray-400">No cities found</li>
        )}
      </ul>
    </div>,
    document.body
  );
}

// ─── Women "Know more" tooltip ─────────────────────────────────────────────────
function WomenTooltip({ onClose }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 w-60 bg-gray-900 text-white text-xs rounded-xl p-3.5 shadow-2xl z-[300] leading-relaxed">
      <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
        <X size={12} />
      </button>
      <p className="font-semibold mb-1 text-white">Booking for women</p>
      Shows only buses with seats reserved exclusively for women. Ensures a safer, more comfortable journey.
      <div className="absolute top-full left-5 border-4 border-transparent border-t-gray-900" />
    </div>
  );
}

// ─── Main SearchForm ───────────────────────────────────────────────────────────
export default function SearchForm() {
  const router = useRouter();
  const { searchParams, setSearchParams, bookingForWomen, setBookingForWomen } = useBookingStore();

  const todayStr    = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const maxDateStr  = format(addDays(new Date(), 90), "yyyy-MM-dd");

  const [from, setFrom]           = useState(searchParams.from || "");
  const [to, setTo]               = useState(searchParams.to   || "");
  const [date, setDate]           = useState(searchParams.date || todayStr);
  const [errors, setErrors]       = useState({});
  const [shaking, setShaking]     = useState({});
  const [fromOpen, setFromOpen]   = useState(false);
  const [toOpen, setToOpen]       = useState(false);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch]   = useState("");
  const [swapAngle, setSwapAngle] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);

  const fromBtnRef   = useRef(null);
  const toBtnRef     = useRef(null);
  const tooltipRef   = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setShowTooltip(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeFrom = useCallback(() => { setFromOpen(false); setFromSearch(""); }, []);
  const closeTo   = useCallback(() => { setToOpen(false);   setToSearch("");   }, []);

  const selectFrom = (city) => {
    setFrom(city);
    setFromOpen(false);
    setFromSearch("");
    setErrors((e) => ({ ...e, from: false }));
    saveRecent(city);
    if (!to) setTimeout(() => setToOpen(true), 150);
  };

  const selectTo = (city) => {
    setTo(city);
    setToOpen(false);
    setToSearch("");
    setErrors((e) => ({ ...e, to: false }));
    saveRecent(city);
  };

  const handleSwap = () => {
    setSwapAngle((a) => a + 180);
    setFrom(to);
    setTo(from);
    setErrors({});
  };

  const shake = (field) => {
    setShaking((s) => ({ ...s, [field]: true }));
    setTimeout(() => setShaking((s) => ({ ...s, [field]: false })), 600);
  };

  const validate = () => {
    const e = {};
    if (!from)                     { e.from = true; shake("from"); }
    if (!to)                       { e.to   = true; shake("to");   }
    if (from && to && from === to) { e.to   = true; shake("to");   }
    if (!date)                     { e.date = true; shake("date"); }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSearchParams({ from, to, date });
    router.push(`/buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };

  const { day, suffix } = (() => {
    if (!date) return { day: "", suffix: "" };
    const p = new Date(date + "T00:00:00");
    return {
      day:    format(p, "d MMM, yyyy"),
      suffix: isToday(p) ? "Today" : isTomorrow(p) ? "Tomorrow" : "",
    };
  })();

  const sectionBase = "flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5 hover:bg-gray-50 transition-colors text-left w-full h-full";

  return (
    <>
      <style>{`
        @keyframes nb-shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        .nb-shake { animation: nb-shake 0.5s ease-in-out; }
      `}</style>

      <form onSubmit={handleSearch} className="w-full max-w-6xl px-2 sm:px-0">

        {/* ── Search card ── */}
        <div className="bg-white rounded-2xl shadow-2xl">
          <div className="flex flex-col lg:flex-row">

            {/* ── FROM ── */}
            <div className={`relative flex-1 min-w-0 ${shaking.from ? "nb-shake" : ""}`}>
              <button
                ref={fromBtnRef}
                type="button"
                onClick={() => { setFromOpen((v) => !v); closeTo(); }}
                className={`${sectionBase} rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none
                  ${errors.from ? "ring-2 ring-inset ring-red-400" : ""}`}
              >
                <Bus size={20} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">From</p>
                  {from
                    ? <p className="text-base font-bold text-gray-900 truncate">{from}</p>
                    : <p className="text-base font-medium text-gray-300">Select city</p>}
                </div>
              </button>

              {/* Desktop swap button */}
              <button
                type="button"
                onClick={handleSwap}
                title="Swap cities"
                className="hidden lg:flex absolute right-0 top-1/2 z-20 w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center shadow-md transition-colors"
                style={{ transform: "translateX(50%) translateY(-50%)" }}
              >
                <ArrowLeftRight size={15} className="text-white" style={{ transform: `rotate(${swapAngle}deg)`, transition: "transform 0.3s ease" }} />
              </button>

              {fromOpen && isMobile && (
                <MobileCityPicker
                  label="From"
                  search={fromSearch}
                  onSearch={setFromSearch}
                  onSelect={selectFrom}
                  selectedCity={from}
                  excludeCity={to}
                  onClose={closeFrom}
                />
              )}
              {fromOpen && !isMobile && (
                <DesktopCityDropdown
                  anchorRef={fromBtnRef}
                  search={fromSearch}
                  onSearch={setFromSearch}
                  onSelect={selectFrom}
                  selectedCity={from}
                  excludeCity={to}
                  onClose={closeFrom}
                />
              )}
            </div>

            {/* Dividers */}
            <div className="hidden lg:block w-px bg-gray-200 my-4 flex-shrink-0" />
            <div className="lg:hidden h-px bg-gray-100 mx-4" />

            {/* ── TO ── */}
            <div className={`relative flex-1 min-w-0 ${shaking.to ? "nb-shake" : ""}`}>
              <button
                ref={toBtnRef}
                type="button"
                onClick={() => { setToOpen((v) => !v); closeFrom(); }}
                className={`${sectionBase} ${errors.to ? "ring-2 ring-inset ring-red-400" : ""}`}
              >
                <Bus size={20} className="text-gray-400 flex-shrink-0 -scale-x-100" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">To</p>
                  {to
                    ? <p className="text-base font-bold text-gray-900 truncate">{to}</p>
                    : <p className="text-base font-medium text-gray-300">Select city</p>}
                </div>
              </button>

              {/* Mobile swap button */}
              <button
                type="button"
                onClick={handleSwap}
                className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center shadow-md"
              >
                <ArrowLeftRight size={14} className="text-white" />
              </button>

              {toOpen && isMobile && (
                <MobileCityPicker
                  label="To"
                  search={toSearch}
                  onSearch={setToSearch}
                  onSelect={selectTo}
                  selectedCity={to}
                  excludeCity={from}
                  onClose={closeTo}
                />
              )}
              {toOpen && !isMobile && (
                <DesktopCityDropdown
                  anchorRef={toBtnRef}
                  search={toSearch}
                  onSearch={setToSearch}
                  onSelect={selectTo}
                  selectedCity={to}
                  excludeCity={from}
                  onClose={closeTo}
                />
              )}
            </div>

            <div className="hidden lg:block w-px bg-gray-200 my-4 flex-shrink-0" />
            <div className="lg:hidden h-px bg-gray-100 mx-4" />

            {/* ── DATE ── */}
            <div className={`relative flex-[1.5] min-w-0 ${shaking.date ? "nb-shake" : ""}`}>
              <div className={`flex items-center gap-2 px-4 sm:px-5 py-4 sm:py-5 hover:bg-gray-50 transition-colors h-full
                ${errors.date ? "ring-2 ring-inset ring-red-400" : ""}`}>

                {/* Transparent native date input covers left side — works on iOS Safari */}
                <div className="relative flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                  <input
                    type="date"
                    value={date}
                    min={todayStr}
                    max={maxDateStr}
                    onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: false })); }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <CalendarDays size={20} className="text-gray-400 flex-shrink-0 pointer-events-none" />
                  <div className="pointer-events-none min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Date of Journey</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-base font-bold text-gray-900 whitespace-nowrap">{day}</p>
                      {suffix && <span className="text-xs text-gray-400 font-medium">({suffix})</span>}
                    </div>
                  </div>
                </div>

                {/* Today / Tomorrow — z-20 so they sit above the transparent input */}
                <div className="flex gap-1.5 flex-shrink-0 relative z-20">
                  <button
                    type="button"
                    onClick={() => { setDate(todayStr); setErrors((er) => ({ ...er, date: false })); }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                      ${date === todayStr
                        ? "bg-blue-100 text-blue-600"
                        : "border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDate(tomorrowStr); setErrors((er) => ({ ...er, date: false })); }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                      ${date === tomorrowStr
                        ? "bg-blue-100 text-blue-600"
                        : "border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"}`}
                  >
                    Tmrw
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-px bg-gray-200 my-4 flex-shrink-0" />
            <div className="lg:hidden h-px bg-gray-100 mx-4" />

            {/* ── BOOKING FOR WOMEN ── */}
            <div className="flex items-center gap-2.5 px-4 sm:px-4 py-4 sm:py-5 rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none hover:bg-gray-50 transition-colors flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <UserRound size={16} className="text-pink-500" />
              </div>
              <div className="flex-shrink-0 relative" ref={tooltipRef}>
                <p className="text-xs font-bold text-gray-800 leading-tight whitespace-nowrap">Booking for women</p>
                <button type="button" onClick={() => setShowTooltip((v) => !v)} className="text-xs text-blue-500 hover:underline whitespace-nowrap">
                  Know more
                </button>
                {showTooltip && <WomenTooltip onClose={() => setShowTooltip(false)} />}
              </div>
              <button
                type="button"
                onClick={() => setBookingForWomen(!bookingForWomen)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${bookingForWomen ? "bg-gray-800" : "bg-gray-300"}`}
                aria-label="Toggle booking for women"
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${bookingForWomen ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

          </div>
        </div>

        {/* ── Search Button ── */}
        <div className="flex justify-center mt-5">
          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 font-semibold text-base text-white w-full sm:w-auto sm:px-20 py-3.5 rounded-full shadow-lg active:scale-95 transition-all border-2 border-white/20 bg-blue-600 hover:bg-blue-700"
          >
            <Search size={18} />
            Search buses
          </button>
        </div>
      </form>
    </>
  );
}
