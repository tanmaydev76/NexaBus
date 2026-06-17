"use client";
import { Tag } from "lucide-react";
import toast from "react-hot-toast";

const BankBadge = ({ logo }) => {
  const styles = {
    IDFC: { bg: "#E8F0FF", text: "#1a3a8f", label: "IDFC FIRST" },
    RBL:  { bg: "#FFE8EE", text: "#c0392b", label: "RBL BANK" },
    AU:   { bg: "#FFF3CD", text: "#7B3F00", label: "AU BANK" },
  };
  const s = styles[logo] || { bg: "#f0f0f0", text: "#555", label: logo };
  return (
    <div
      className="w-16 h-10 rounded-lg flex items-center justify-center text-xs font-bold tracking-tight"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </div>
  );
};

const IllustrationBadge = ({ type }) => {
  const map = { bus: "🚌", festival: "🎉", weekend: "🌅" };
  return (
    <div className="w-14 h-14 flex items-center justify-center text-4xl opacity-80 select-none">
      {map[type] || "🎫"}
    </div>
  );
};

export default function OfferCard({ offer, onApply }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      toast.success("Code Copied!", { icon: "📋" });
    } catch {
      toast.success("Code Copied!", { icon: "📋" });
    }
  };

  return (
    <div
      className="relative flex-shrink-0 min-w-[280px] w-72 rounded-2xl p-5 flex flex-col justify-between gap-3 cursor-pointer
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{ backgroundColor: offer.bgColor }}
    >
      {/* Category badge */}
      <div>
        <span className="inline-block bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {offer.category}
        </span>
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{offer.title}</h3>
        <p className="text-xs text-gray-500 mt-1">Valid till {offer.validTill}</p>
      </div>

      {/* Bottom row: coupon chip + illustration */}
      <div className="flex items-end justify-between mt-1">
        <button
          type="button"
          onClick={onApply ? () => onApply(offer.code) : handleCopy}
          className="flex items-center gap-1.5 border border-gray-400 bg-white/70 hover:bg-white rounded-full px-3 py-1.5 transition-colors group"
        >
          <Tag size={13} className="text-gray-600 flex-shrink-0" />
          <span className="font-mono text-xs font-bold text-gray-800 tracking-wider">
            {offer.code}
          </span>
        </button>

        <div className="flex-shrink-0">
          {offer.bankLogo ? (
            <BankBadge logo={offer.bankLogo} />
          ) : offer.illustration ? (
            <IllustrationBadge type={offer.illustration} />
          ) : null}
        </div>
      </div>

      {onApply && (
        <button
          type="button"
          onClick={() => onApply(offer.code)}
          className="w-full mt-1 bg-white/80 hover:bg-white border border-gray-300 text-gray-800 text-xs font-semibold py-1.5 rounded-xl transition-colors"
        >
          Apply
        </button>
      )}
    </div>
  );
}
