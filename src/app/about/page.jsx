import Link from "next/link";
import {
  Bus, Shield, Zap, MapPin, Star, Users, Clock, HeartHandshake,
  CheckCircle, ArrowRight, Wifi, BatteryCharging, Armchair, Lock,
} from "lucide-react";

const STATS = [
  { value: "50+",  label: "Bus Operators",  icon: Bus },
  { value: "200+", label: "Daily Routes",    icon: MapPin },
  { value: "11",   label: "Cities Covered",  icon: MapPin },
  { value: "4.5★", label: "Avg. Rating",     icon: Star },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Booking",
    desc: "Confirm your seat in under 60 seconds. Real-time seat availability so you always know what's left.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    desc: "Every operator on NexaBus is vetted for safety standards, insurance compliance, and passenger feedback.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Armchair,
    title: "Choose Your Seat",
    desc: "Interactive seat maps for seater and sleeper buses — pick your preferred window, aisle, or berth.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    desc: "Know exactly where your bus is. Real-time GPS tracking so you and your family stay informed.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: HeartHandshake,
    title: "Women's Safety",
    desc: "Dedicated women-only seating filters and female-reserved berths for a safer journey.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Lock,
    title: "Free Cancellation",
    desc: "Plans change — we get it. Cancel eligible tickets for free up to 2 hours before departure.",
    color: "bg-orange-50 text-orange-600",
  },
];

const AMENITIES = [
  { icon: Wifi,            label: "Free WiFi" },
  { icon: BatteryCharging, label: "Charging Points" },
  { icon: Armchair,        label: "Recliner Seats" },
  { icon: Shield,          label: "CCTV Cameras" },
  { icon: Clock,           label: "On-Time Guarantee" },
  { icon: Star,            label: "Premium Operators" },
];

const WHY_US = [
  "No hidden charges — the price you see is what you pay",
  "Instant booking confirmation via SMS & email",
  "24/7 customer support for booking issues",
  "Secure payment gateway with multiple options",
  "Dedicated women-safety filter for all routes",
  "Live bus tracking for select operators",
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Bus size={15} />
            About NexaBus
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
            Redefining Bus Travel<br />
            <span className="text-yellow-300">Across Maharashtra</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            NexaBus is a modern bus ticket booking platform built to make intercity travel simple,
            transparent, and comfortable — for every kind of traveller.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              Book a ticket <ArrowRight size={16} />
            </Link>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              View my bookings
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <div className="flex justify-center mb-2">
                  <Icon size={22} className="text-blue-400" />
                </div>
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5 leading-snug">
              Making every journey feel like it was planned just for you
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We started NexaBus because booking a bus ticket shouldn't be complicated.
              Long queues, uncertain seat availability, opaque pricing — we've experienced
              it all, and we built something better.
            </p>
            <p className="text-gray-500 leading-relaxed">
              From Mumbai to Pune, Nashik to Nagpur — NexaBus connects Maharashtra's cities
              with a single, seamless platform that puts passengers first.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {WHY_US.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3.5">
                <CheckCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-snug">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">What we offer</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Everything you need for a great trip</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">On board</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Premium amenities on select buses</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {AMENITIES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2.5 bg-blue-50 rounded-2xl py-6 px-3 text-center">
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon size={20} className="text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-blue-800 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-3xl font-extrabold text-white">Book your ticket in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Search",       desc: "Enter your origin, destination, and date" },
              { step: "2", title: "Pick a bus",   desc: "Compare operators, timings, and prices" },
              { step: "3", title: "Choose seat",  desc: "Select your exact seat from the live map" },
              { step: "4", title: "Confirm",      desc: "Pay securely and get instant confirmation" },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative text-center">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-px border-t-2 border-dashed border-gray-700" />
                )}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 relative z-10">
                  {step}
                </div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to hit the road?</h2>
          <p className="text-blue-100 mb-8 text-lg">Book your next bus ticket in under a minute.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-full shadow-xl hover:bg-blue-50 transition-colors text-base"
          >
            <Bus size={18} />
            Search buses now
          </Link>
        </div>
      </section>

    </div>
  );
}
