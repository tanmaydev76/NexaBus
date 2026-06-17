"use client";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import LogoPlaceholder from "./LogoPlaceholder";
import useBookingStore from "@/store/bookingStore";
import { format } from "date-fns";

const APP_NAME = "NexaBus";

function getTrustContent(operator) {
  if (operator.trustMessage.startsWith("Get instant")) {
    return { prefix: null, highlight: null, suffix: operator.trustMessage };
  }
  return {
    prefix: `${APP_NAME} is the most `,
    highlight: "trusted",
    suffix: ` place to book ${operator.shortName} tickets online`,
  };
}

export default function GovBusCard({ operator }) {
  const router = useRouter();
  const { clearAllFilters, toggleOperator } = useBookingStore();

  const handleClick = () => {
    clearAllFilters();
    toggleOperator(operator.shortName);
    const today = format(new Date(), "yyyy-MM-dd");
    router.push(`/buses?from=Mumbai&to=Pune&date=${today}&operator=${operator.id}`);
  };

  const servicesText = `${operator.totalServices.toLocaleString()} services including ${operator.popularServices.join(", ")} and more`;
  const trust = getTrustContent(operator);

  return (
    <div
      onClick={handleClick}
      className="w-[270px] min-w-[270px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* ── Top: logo + name + rating ── */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <LogoPlaceholder color={operator.logoColor} initials={operator.logoInitials} />
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900 leading-tight">{operator.shortName}</span>
            <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              ★ {operator.rating.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[160px]" title={operator.fullName}>
            {operator.fullName}
          </p>
          <p className="text-[10px] text-gray-300 truncate max-w-[160px]" title={operator.regionalName}>
            {operator.regionalName}
          </p>
        </div>
      </div>

      {/* ── Middle: services count ── */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-[12px] text-gray-500 text-center leading-relaxed">{servicesText}</p>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-gray-100" />

      {/* ── Official partner badge ── */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Bus size={14} className="text-pink-400 flex-shrink-0" />
        <p className="text-[11px] text-gray-500 leading-tight">
          Official booking partner of <span className="font-semibold text-gray-700">{operator.shortName}</span>
        </p>
      </div>

      {/* ── Trust footer ── */}
      <div className="bg-red-50 px-4 py-2.5 rounded-b-2xl">
        <p className="text-[11px] font-semibold text-gray-700 text-center leading-snug">
          {trust.prefix && (
            <>
              {trust.prefix}
              <span className="text-red-500">{trust.highlight}</span>
              {trust.suffix}
            </>
          )}
          {!trust.prefix && trust.suffix}
        </p>
      </div>
    </div>
  );
}
