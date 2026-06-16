"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown, LogOut, Ticket, UserCircle, Users,
  Menu, X, Home, Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const BusSideIcon = () => (
  <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="34" height="18" rx="4" fill="#1a56db"/>
    <rect x="1" y="3" width="34" height="4" rx="4" fill="#1e429f"/>
    <path d="M35 5 L37 7 L37 21 L35 21 Z" fill="#1a56db"/>
    <rect x="35" y="14" width="2" height="6" rx="1" fill="#1e429f"/>
    <rect x="5"  y="6" width="6" height="6" rx="1.5" fill="#93c5fd"/>
    <rect x="13" y="6" width="6" height="6" rx="1.5" fill="#93c5fd"/>
    <rect x="21" y="6" width="6" height="6" rx="1.5" fill="#93c5fd"/>
    <rect x="29" y="6" width="4" height="6" rx="1.5" fill="#bfdbfe"/>
    <rect x="1" y="15" width="34" height="2" fill="#1e429f"/>
    <rect x="4" y="13" width="5" height="7" rx="1" fill="#1e429f"/>
    <line x1="6.5" y1="13" x2="6.5" y2="20" stroke="#3b82f6" strokeWidth="0.8"/>
    <rect x="33" y="9" width="3" height="3" rx="1" fill="#fde68a"/>
    <rect x="1" y="20" width="34" height="2" rx="1" fill="#1e429f"/>
    <circle cx="9"  cy="24" r="4" fill="#111827"/>
    <circle cx="9"  cy="24" r="2" fill="#374151"/>
    <circle cx="9"  cy="24" r="0.9" fill="#9ca3af"/>
    <circle cx="28" cy="24" r="4" fill="#111827"/>
    <circle cx="28" cy="24" r="2" fill="#374151"/>
    <circle cx="28" cy="24" r="0.9" fill="#9ca3af"/>
    <rect x="1" y="18" width="2" height="4" rx="1" fill="#374151"/>
  </svg>
);

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    toast.success("Signed out");
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const mobileNavLinks = [
    { href: "/", icon: <Home size={18} />, label: "Home" },
    { href: "/about", icon: <Info size={18} />, label: "About" },
    ...(user ? [
      { href: "/my-bookings", icon: <Ticket size={18} />, label: "My Bookings" },
      { href: "/profile", icon: <UserCircle size={18} />, label: "My Profile" },
      { href: "/profile/travellers", icon: <Users size={18} />, label: "My Travellers" },
    ] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="group-hover:scale-105 transition-transform duration-150">
                <BusSideIcon />
              </div>
              <div className="flex items-baseline leading-none gap-[1px]">
                <span className="text-xl sm:text-[1.45rem] font-black tracking-tight text-gray-900">nexa</span>
                <span className="text-xl sm:text-[1.45rem] font-black tracking-tight text-blue-600">Bus</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>

              {!loading && (
                user ? (
                  <>
                    <Link href="/my-bookings" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                      My Bookings
                    </Link>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {initials}
                        </div>
                        <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                          {user.name?.split(" ")[0]}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 py-1 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                          <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <UserCircle size={16} className="text-gray-400" /> My Profile
                          </Link>
                          <Link href="/my-bookings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Ticket size={16} className="text-gray-400" /> My Bookings
                          </Link>
                          <Link href="/profile/travellers" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Users size={16} className="text-gray-400" /> My Travellers
                          </Link>
                          <div className="border-t border-gray-100 mx-3 my-1" />
                          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Link href="/auth/login" className="text-sm font-bold px-5 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                    Sign In
                  </Link>
                )
              )}
            </nav>

            {/* Mobile right side */}
            <div className="sm:hidden flex items-center gap-2">
              {!loading && !user && (
                <Link href="/auth/login" className="text-sm font-bold px-4 py-1.5 rounded-full text-white bg-blue-600">
                  Sign In
                </Link>
              )}
              {!loading && user && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {initials}
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} className="text-gray-700" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />

          {/* Drawer */}
          <div className="relative ml-auto w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-base">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-4 border-b border-gray-100 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 py-2 overflow-y-auto">
              {mobileNavLinks.map(({ href, icon, label }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-400">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Bottom action */}
            <div className="p-4 border-t border-gray-100">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 bg-blue-600 text-white font-bold rounded-xl text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
