"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Bus, CalendarDays, ArrowLeftRight } from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import toast from "react-hot-toast";
import { cities as staticCities } from "@/lib/mockData";
import { MobileCityPicker, DesktopCityDropdown, saveRecent } from "@/components/CityPickers";

export default function CompactSearchBar({ initialFrom, initialTo, initialDate }) {
  const router = useRouter();

  const todayStr    = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const maxDateStr  = format(addDays(new Date(), 90), "yyyy-MM-dd");

  const [from, setFrom] = useState(initialFrom || "");
  const [to, setTo]     = useState(initialTo   || "");
  const [date, setDate] = useState(initialDate || todayStr);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen]     = useState(false);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch]     = useState("");
  const [swapAngle, setSwapAngle]   = useState(0);
  const [isMobile, setIsMobile]     = useState(false);
  const [cities, setCities]         = useState(staticCities);

  // Keep the bar in sync if the URL changes from elsewhere (e.g. browser back/forward).
  useEffect(() => { setFrom(initialFrom || ""); }, [initialFrom]);
  useEffect(() => { setTo(initialTo || ""); }, [initialTo]);
  useEffect(() => { setDate(initialDate || todayStr); }, [initialDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => {
        if (data.cities?.length) {
          const merged = [...new Set([...staticCities, ...data.cities])].sort();
          setCities(merged);
        }
      })
      .catch(() => {});
  }, []);

  const fromBtnRef   = useRef(null);
  const toBtnRef      = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const closeFrom = useCallback(() => { setFromOpen(false); setFromSearch(""); }, []);
  const closeTo   = useCallback(() => { setToOpen(false);   setToSearch("");   }, []);

  const selectFrom = (city) => {
    setFrom(city);
    setFromOpen(false);
    setFromSearch("");
    saveRecent(city);
  };

  const selectTo = (city) => {
    setTo(city);
    setToOpen(false);
    setToSearch("");
    saveRecent(city);
  };

  const handleSwap = () => {
    setSwapAngle((a) => a + 180);
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) { toast.error("Please select both From and To cities."); return; }
    if (from === to) { toast.error("From and To cities can't be the same."); return; }
    if (!date) { toast.error("Please select a date of journey."); return; }
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-center">
        {/* FROM */}
        <div className="relative flex-1 min-w-0">
          <button
            ref={fromBtnRef}
            type="button"
            onClick={() => { setFromOpen((v) => !v); closeTo(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
          >
            <Bus size={17} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">From</p>
              {from ? <p className="text-sm font-bold text-gray-900 truncate">{from}</p> : <p className="text-sm font-medium text-gray-300">Select city</p>}
            </div>
          </button>

          {/* Desktop swap button */}
          <button
            type="button"
            onClick={handleSwap}
            title="Swap cities"
            className="hidden lg:flex absolute right-0 top-1/2 z-20 w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded-full items-center justify-center shadow-md transition-colors"
            style={{ transform: "translateX(50%) translateY(-50%)" }}
          >
            <ArrowLeftRight size={12} className="text-white" style={{ transform: `rotate(${swapAngle}deg)`, transition: "transform 0.3s ease" }} />
          </button>

          {fromOpen && isMobile && (
            <MobileCityPicker label="From" search={fromSearch} onSearch={setFromSearch} onSelect={selectFrom} selectedCity={from} excludeCity={to} onClose={closeFrom} cities={cities} />
          )}
          {fromOpen && !isMobile && (
            <DesktopCityDropdown anchorRef={fromBtnRef} search={fromSearch} onSearch={setFromSearch} onSelect={selectFrom} selectedCity={from} excludeCity={to} onClose={closeFrom} cities={cities} />
          )}
        </div>

        <div className="hidden lg:block w-px bg-gray-200 my-2.5 flex-shrink-0" />
        <div className="lg:hidden h-px bg-gray-100 mx-4" />

        {/* TO */}
        <div className="relative flex-1 min-w-0">
          <button
            ref={toBtnRef}
            type="button"
            onClick={() => { setToOpen((v) => !v); closeFrom(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <Bus size={17} className="text-gray-400 flex-shrink-0 -scale-x-100" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">To</p>
              {to ? <p className="text-sm font-bold text-gray-900 truncate">{to}</p> : <p className="text-sm font-medium text-gray-300">Select city</p>}
            </div>
          </button>

          {/* Mobile swap button */}
          <button
            type="button"
            onClick={handleSwap}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shadow-md"
          >
            <ArrowLeftRight size={13} className="text-white" />
          </button>

          {toOpen && isMobile && (
            <MobileCityPicker label="To" search={toSearch} onSearch={setToSearch} onSelect={selectTo} selectedCity={to} excludeCity={from} onClose={closeTo} cities={cities} />
          )}
          {toOpen && !isMobile && (
            <DesktopCityDropdown anchorRef={toBtnRef} search={toSearch} onSearch={setToSearch} onSelect={selectTo} selectedCity={to} excludeCity={from} onClose={closeTo} cities={cities} />
          )}
        </div>

        <div className="hidden lg:block w-px bg-gray-200 my-2.5 flex-shrink-0" />
        <div className="lg:hidden h-px bg-gray-100 mx-4" />

        {/* DATE */}
        <div className="relative flex-[1.3] min-w-0">
          <div className="flex items-center gap-2 px-4 py-3">
            <div
              className="relative flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
            >
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                min={todayStr}
                max={maxDateStr}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <CalendarDays size={17} className="text-gray-400 flex-shrink-0 pointer-events-none" />
              <div className="pointer-events-none min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Date of Journey</p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{day}</p>
                  {suffix && <span className="text-xs text-gray-400 font-medium">({suffix})</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 flex-shrink-0 relative z-20">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                  ${date === todayStr ? "bg-blue-100 text-blue-600" : "border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                  ${date === tomorrowStr ? "bg-blue-100 text-blue-600" : "border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"}`}
              >
                Tmrw
              </button>
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="p-3 lg:pl-0">
          <button
            type="submit"
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
