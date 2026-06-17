import SearchForm from "@/components/SearchForm";
import OffersSection from "@/components/offers/OffersSection";
import GovernmentBusesSection from "@/components/home/GovernmentBusesSection";
import { popularRoutes } from "@/lib/mockData";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Travel Smarter,{" "}
              <span className="text-yellow-300">Book Faster</span>
            </h1>
            <p className="mt-4 text-blue-100 text-lg max-w-xl mx-auto">
              Book bus tickets across Maharashtra instantly. Safe, comfortable, and affordable journeys await.
            </p>
          </div>
          <div className="flex justify-center">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "🛡️", title: "Safe & Secure", desc: "Verified bus operators with safety standards" },
            { icon: "💺", title: "Choose Your Seat", desc: "Interactive seat maps for the perfect journey" },
            { icon: "⚡", title: "Instant Booking", desc: "Confirm your seat in under a minute" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Popular Routes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route, i) => (
            <Link
              key={i}
              href={`/buses?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${new Date().toISOString().split("T")[0]}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-800">
                  <MapPin size={14} className="text-blue-500" />
                  <span className="font-semibold text-sm">{route.from}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="font-semibold text-sm">{route.to}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">{route.duration}</div>
                <div className="text-sm font-bold text-blue-600">
                  From ₹{route.price}
                  <ArrowRight size={12} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <OffersSection />

      <GovernmentBusesSection />
    </div>
  );
}
