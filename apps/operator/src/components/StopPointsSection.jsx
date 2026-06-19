"use client";
import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, MapPin } from "lucide-react";

const CITY_SUGGESTIONS = {
  "Mumbai":      ["Mumbai Central", "Dadar", "Borivali", "Andheri", "Thane", "Panvel", "Bandra", "Kurla", "Vile Parle"],
  "Pune":        ["Swargate", "Shivajinagar", "Hadapsar", "Wakad", "Kothrud", "Pimpri", "Chinchwad", "Deccan", "Katraj"],
  "Nashik":      ["CBS Nashik", "Nashik Road", "Mumbai Naka", "Dwarka Circle", "Mahamarg Bus Depot"],
  "Nagpur":      ["Nagpur CBS", "Sitabuldi", "Sadar", "Wardha Road", "Ajni"],
  "Kolhapur":    ["Kolhapur CBS", "Rankala", "Mahadwar Road", "Rajaram Road", "Tarabai Park"],
  "Aurangabad":  ["Aurangabad CBS", "Cidco", "Mondha Naka", "Garkheda"],
  "Solapur":     ["Solapur CBS", "Railway Station", "Hotgi Road"],
  "Satara":      ["Satara Bus Stand", "Powai Naka", "Degaon Naka"],
  "Sangli":      ["Sangli CBS", "Miraj Bus Stand", "Vishrambag"],
  "Chandgad":    ["Chandgad Bus Stand", "Chandgad Market"],
  "Gadhinglaj":  ["Gadhinglaj Bus Stand"],
  "Ajara":       ["Ajara Bus Stand"],
  "Latur":       ["Latur CBS", "Railway Station"],
  "Nanded":      ["Nanded CBS", "Shivaji Nagar"],
  "Jalgaon":     ["Jalgaon Bus Stand", "Railway Station"],
  "Amravati":    ["Amravati CBS", "Railway Station"],
  "Akola":       ["Akola CBS", "Railway Station"],
  "Ichalkaranji":["Ichalkaranji CBS", "Mangalwar Peth"],
  "Karad":       ["Karad Bus Stand", "Panchaganga Ghat"],
};

function getSuggestions(city, query) {
  if (!query) return [];
  const cityKey = Object.keys(CITY_SUGGESTIONS).find(
    (k) => k.toLowerCase() === (city || "").toLowerCase()
  );
  if (!cityKey) return [];
  return CITY_SUGGESTIONS[cityKey].filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );
}

// ─── Single point row ──────────────────────────────────────────────────────────
function PointRow({
  point, index, total, color, timeLabel,
  city, onUpdate, onRemove, onMoveUp, onMoveDown,
}) {
  const [suggestions, setSuggestions] = useState([]);

  const dot   = color === "green" ? "bg-green-500" : "bg-red-500";
  const badge = color === "green"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
  const ring  = color === "green" ? "focus:ring-green-200 focus:border-green-400" : "focus:ring-red-200 focus:border-red-400";

  const inputCls = `w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${ring} bg-white`;

  const handleNameChange = (val) => {
    onUpdate(index, "name", val);
    setSuggestions(getSuggestions(city, val));
  };

  const pickSuggestion = (s) => {
    onUpdate(index, "name", s);
    setSuggestions([]);
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      {/* Row header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>
          {index + 1}
        </span>
        <span className="text-xs font-semibold text-slate-500 flex-1">
          Stop {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={total === 1}
            className="p-1 rounded hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 hover:text-red-600"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Point Name with autocomplete */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">Point Name *</label>
          <input
            type="text"
            value={point.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            placeholder="e.g. Swargate Bus Stand"
            className={inputCls}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => pickSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                  >
                    <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{timeLabel} *</label>
          <input
            type="time"
            value={point.time}
            onChange={(e) => onUpdate(index, "time", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Landmark */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Landmark (optional)</label>
          <input
            type="text"
            value={point.landmark}
            onChange={(e) => onUpdate(index, "landmark", e.target.value)}
            placeholder="e.g. Near ST Depot"
            className={inputCls}
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Contact Number (optional)</label>
          <input
            type="tel"
            value={point.contactNumber}
            onChange={(e) => onUpdate(index, "contactNumber", e.target.value)}
            placeholder="e.g. 9876543210"
            maxLength={10}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
export default function StopPointsSection({
  title, color, points, city, timeLabel,
  onAdd, onRemove, onUpdate, onMoveUp, onMoveDown,
  error,
}) {
  const dot = color === "green" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">({points.length})</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline"
        >
          <Plus size={14} />
          Add {title.replace(" Points", " Point")}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </p>
      )}

      {points.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">
          No {title.toLowerCase()} added yet. Click the button above to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {points.map((point, i) => (
            <PointRow
              key={i}
              point={point}
              index={i}
              total={points.length}
              color={color}
              timeLabel={timeLabel}
              city={city}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}
