"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Bus, Clock, X } from "lucide-react";
import { createPortal } from "react-dom";

// ─── localStorage helpers ──────────────────────────────────────────────────────
export const getRecent = () => {
  try { return JSON.parse(localStorage.getItem("nb_recent_cities") || "[]"); } catch { return []; }
};
export const saveRecent = (city) => {
  try {
    const updated = [city, ...getRecent().filter((c) => c !== city)].slice(0, 5);
    localStorage.setItem("nb_recent_cities", JSON.stringify(updated));
  } catch {}
};

// ─── Highlight matching characters ────────────────────────────────────────────
export function Highlight({ text, query }) {
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
export function MobileCityPicker({ label, search, onSearch, onSelect, selectedCity, excludeCity, onClose, cities }) {
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
export function DesktopCityDropdown({ anchorRef, search, onSearch, onSelect, selectedCity, excludeCity, onClose, cities }) {
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
